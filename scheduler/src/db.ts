import { Pool } from 'pg';
import dotenv from 'dotenv';
import { ScheduledTask } from './types';

// Load environment variables from specific paths if needed, or default to .env
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5969'),
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'mydb',
});

// Test the connection
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),
    pool,
    getActiveProducts,
    getCampaignAudiences,
    getAudiencesByIds,
    getAudiences,
    setExecutionRunning,
    setExecutionCompleted,
    setExecutionFailed,
    getDueTasks,
    updateTask,
    createExecutionRecord,
    getAudienceMembers
};

async function getDueTasks() {
    const res = await db.query(`
        SELECT * FROM scheduled_tasks 
        WHERE enabled = true 
          AND (next_run_at <= NOW() OR next_run_at IS NULL)
      `);
    return res.rows;
}

/**
 * Updates a task's next run time and enabled status.
 * @param task 
 * @param nextRun 
 * @param enabled 
 */
async function updateTask(task: ScheduledTask, nextRun: Date | null, enabled: boolean) {
    await db.query(
        `UPDATE scheduled_tasks 
         SET last_run_at = NOW(), 
             next_run_at = $1,
             enabled = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [nextRun, enabled, task.id]
    );
}

async function createExecutionRecord(task: ScheduledTask) {
    const executionRes = await db.query(
        `INSERT INTO task_executions (task_id, status) VALUES ($1, 'pending') RETURNING id`,
        [task.id]
    );
    const executionId = executionRes.rows[0].id;
    return executionId;
}


/**
 * Queries currently available active products.
 */
async function getActiveProducts() {
    return await db.query(`SELECT * FROM products WHERE is_active = true`);
}

/**
 * Retrieves audience IDs associated with a specific campaign (task).
 */
async function getCampaignAudiences(taskId: number) {
    return (await db.query(`SELECT * FROM campaign_audiences WHERE campaign_id = $1`, [taskId])).rows;
}

/**
 * Retrieves full audience details for a list of audience IDs.
 */
async function getAudiencesByIds(audienceIds: number[]) {
    if (audienceIds.length === 0) {
        return { rows: [] };
    }
    // Note: Parameterized query for IN clause requires dynamic generation or array support if using pg-promise directly, 
    // but here we are using standard pg. 
    // However, the original code used `id IN ($1)` with an array, which might not work as expected in standard pg unless handled.
    // The original code passed `[audiencesIds.rows.map(...)]`. 
    // If we assume the original code was working or we want to fix it:
    // Postgres `ANY` is often better for arrays: `id = ANY($1::int[])`
    return db.query(`SELECT * FROM audiences WHERE id = ANY($1::int[])`, [audienceIds]);
}

/**
 * Orchestrates fetching all audiences for a task.
 */
async function getAudiences(task: ScheduledTask) {
    const campaignAudiences = await getCampaignAudiences(task.id);
    console.log("campaignAudiences: ", campaignAudiences);
    const audienceIds = campaignAudiences.map((row) => row.audience_id);
    const audiences = await getAudiencesByIds(audienceIds);
    return audiences.rows;
}

/**
 * Retrieves members of a specific audience.
 * @param audienceId 
 * @returns 
 */
async function getAudienceMembers(audienceId: number) {
    return (await db.query(`
        SELECT contacts.* 
        FROM audience_contacts 
        JOIN contacts ON audience_contacts.contact_id = contacts.id
        WHERE audience_contacts.audience_id = $1
        `
        , [audienceId])).rows;
}

/**
 * Updates the execution status to 'running'.
 */
async function setExecutionRunning(executionId: number) {
    await db.query(`UPDATE task_executions SET status = 'running' WHERE id = $1`, [executionId]);
}

/**
 * Updates the execution status to 'completed' and logs the summary.
 */
async function setExecutionCompleted(executionId: number, logSummary: string) {
    await db.query(
        `UPDATE task_executions 
       SET status = 'completed', completed_at = NOW(), log = $2 
       WHERE id = $1`,
        [executionId, logSummary]
    );
}

/**
 * Updates the execution status to 'failed' and logs the error.
 */
async function setExecutionFailed(executionId: number, errorMsg: string) {
    await db.query(
        `UPDATE task_executions 
       SET status = 'failed', completed_at = NOW(), log = $2 
       WHERE id = $1`,
        [executionId, errorMsg]
    );
}
