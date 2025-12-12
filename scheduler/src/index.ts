import { Pool, PoolClient } from 'pg';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5969/mydb';
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '15000');
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3');

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
});

interface Campaign {
  id: number;
  name: string;
  run_at: string;
}

/**
 * Log with timestamp
 */
function log(message: string, level: 'INFO' | 'ERROR' | 'DEBUG' = 'INFO') {
  console.log(`[${new Date().toISOString()}] [${level}] ${message}`);
}

/**
 * Get database connection
 */
async function getConnection(): Promise<PoolClient> {
  try {
    return await pool.connect();
  } catch (error) {
    log(`Failed to connect to database: ${error}`, 'ERROR');
    throw error;
  }
}

/**
 * Fetch pending campaigns that are due to run
 */
async function getPendingCampaigns(): Promise<Campaign[]> {
  const client = await getConnection();
  try {
    const result = await client.query<Campaign>(
      `SELECT id, name, run_at
       FROM campaigns 
       WHERE run_at <= NOW() 
       AND (status IS NULL OR status = 'pending')
       ORDER BY run_at ASC`
    );
    return result.rows;
  } catch (error) {
    log(`Error fetching pending campaigns: ${error}`, 'ERROR');
    return [];
  } finally {
    client.release();
  }
}

/**
 * Execute campaign by calling its endpoint
 */
async function executeCampaign(campaign: Campaign): Promise<boolean> {
  try {
    log(`Executing campaign ${campaign.id} (${campaign.name})`);
    
    /* const response = await axios.post(endpoint_url, {
      campaignId: campaign.id,
      campaignName: campaign.name,
    }, {
      timeout: 30000, // 30 second timeout
    }); */
   
    // 1. Get audiences for this campaign

    // 2. Loop through audiences
   
    // 2.1 Maybe personalize message

    // 3. Get audience members

    // 4. Send messages to audience members

    // log(`Campaign ${campaign.id} executed successfully - Status: ${response.status}`);
    return true;
  } catch (error) {
    log(`Failed to execute campaign ${campaign.id}: ${error}`, 'ERROR');
    return false;
  }
}

/**
 * Update campaign status in database
 */
async function updateCampaignStatus(
  campaignId: number,
  status: 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  const client = await getConnection();
  try {
    await client.query(
      `UPDATE campaigns 
       SET status = $1, executed_at = NOW()
       WHERE id = $2`,
      [status, campaignId]
    );
    log(`Campaign ${campaignId} status updated to ${status}`);
  } catch (error) {
    log(`Error updating campaign ${campaignId} status: ${error}`, 'ERROR');
  } finally {
    client.release();
  }
}

/**
 * Main scheduler loop
 */
async function scheduler(): Promise<void> {
  log('Campaign scheduler started');

  while (true) {
    try {
      const campaigns = await getPendingCampaigns();

      if (campaigns.length > 0) {
        log(`Found ${campaigns.length} pending campaign(s) to execute`);

        for (const campaign of campaigns) {
          const success = await executeCampaign(campaign);
          const status = success ? 'completed' : 'failed';
          const errorMessage = success ? undefined : 'HTTP request failed';
          await updateCampaignStatus(campaign.id, status, errorMessage);
        }
      } else {
        log(`No pending campaigns found`, 'DEBUG');
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    } catch (error) {
      log(`Unexpected error in scheduler loop: ${error}`, 'ERROR');
      // Continue the loop even on error
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

// Start the scheduler
scheduler().catch((error) => {
  log(`Fatal error: ${error}`, 'ERROR');
  process.exit(1);
});