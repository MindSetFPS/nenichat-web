import { Pool } from 'pg';
import { ICampaign } from '../dto/ICampaign';
import { ICampaignRepository } from './ICampaignRepository';
import { Campaign } from './Campaign';
import { pool } from './db';

export class CampaignRepository implements ICampaignRepository {
  constructor(private pool: Pool) { }

  private toCampaign(data: any): ICampaign {
    if (!data) return data;
    return new Campaign(data.id, data.name, data.created_at, data.run_at, data.description);
  }

  async findById(id: string): Promise<ICampaign | null> {
    const result = await this.pool.query('SELECT * FROM campaigns WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }
    return this.toCampaign(result.rows[0]);
  }

  async create(campaign: Partial<ICampaign>): Promise<ICampaign> {
    const { name, run_at, description } = campaign;

    if (!name) {
      throw new Error('Campaign name is required to create a campaign.');
    }

    const result = await this.pool.query(
      'INSERT INTO campaigns (name, run_at, description) VALUES ($1, $2, $3) RETURNING *',
      [name, run_at instanceof Date ? run_at.toTimeString().split(' ')[0] : run_at, description || null]
    );

    if (!result || result.rows.length === 0) {
      throw new Error('Failed to create campaign.');
    }
    return this.toCampaign(result.rows[0]);
  }

  async update(campaign: Partial<ICampaign>): Promise<ICampaign> {
    const { id, name, run_at, description } = campaign;

    if (!id) {
      throw new Error('Campaign ID is required to update a campaign.');
    }

    const existingCampaign = await this.findById(id);
    if (!existingCampaign) {
      throw new Error(`Campaign with ID ${id} not found.`);
    }

    const campaignToUpdate = { ...existingCampaign, ...campaign };

    const result = await this.pool.query(
      `UPDATE campaigns
      SET
        name = $1,
        run_at = $2,
        description = $3,
        created_at = $4
      WHERE id = $5
      RETURNING *`,
      [campaignToUpdate.name, campaignToUpdate.run_at || null, campaignToUpdate.description || null, campaignToUpdate.created_at, id]
    );

    if (!result || result.rows.length === 0) {
      throw new Error('Failed to update campaign.');
    }
    return this.toCampaign(result.rows[0]);
  }

  async list(offset: number, limit: number): Promise<ICampaign[]> {
    const result = await this.pool.query(
      'SELECT * FROM campaigns ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return result.rows.map((d) => this.toCampaign(d));
  }
}

export const campaignRepository = new CampaignRepository(pool);