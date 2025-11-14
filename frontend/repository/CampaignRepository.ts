import { Pool } from "pg";
import { ICampaign } from "../dto/ICampaign";
import { ICampaignRepository } from "./ICampaignRepository";
import { Campaign } from "./Campaign";
import { pool } from "./db";

export class CampaignRepository implements ICampaignRepository {
  constructor(private pool: Pool) {}

  private async toCampaign(data: any, includeMessage: boolean): Promise<ICampaign> {
    if (!data) return data;
    const campaign = new Campaign(
      data.id,
      data.name,
      data.created_at,
      data.run_at,
      data.description
    );
    if (data.audience_ids) {
      campaign.audienceIds = (data.audience_ids[0] === null ? [] : data.audience_ids).map(Number);
    }

    if (includeMessage) {
      const messageResult = await this.pool.query('SELECT * FROM campaign_messages WHERE campaign_id = $1', [campaign.id]);
      if (messageResult.rows.length > 0) {
        campaign.message = messageResult.rows[0].content;
      }
    }
    return campaign;
  }

  async findById(
    id: string,
    includeAudiences = false,
    includeMessage = false
  ): Promise<ICampaign | null> {
    let query = "SELECT * FROM campaigns WHERE id = $1";
    if (includeAudiences) {
      query = `
        SELECT c.*, array_agg(ca.audience_id) as audience_ids
        FROM campaigns c
        LEFT JOIN campaign_audiences ca ON c.id = ca.campaign_id
        WHERE c.id = $1
        GROUP BY c.id
      `;
    }
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }
    return await this.toCampaign(result.rows[0], includeMessage);
  }

  async create(campaign: Partial<ICampaign>): Promise<ICampaign> {
    const { name, run_at, description, audienceIds, message } = campaign;

    if (!name) {
      throw new Error("Campaign name is required to create a campaign.");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "INSERT INTO campaigns (name, run_at, description) VALUES ($1, $2, $3) RETURNING *",
        [
          name,
          run_at || null,
          description || null,
        ]
      );

      const newCampaign = result.rows[0];

      if (audienceIds && audienceIds.length > 0) {
        const values = audienceIds
          .map((_, i) => `($1, $${i + 2})`)
          .join(", ");
        await client.query(
          `INSERT INTO campaign_audiences (campaign_id, audience_id) VALUES ${values}`,
          [newCampaign.id, ...audienceIds]
        );
      }

      if (message) {
        await client.query(
          'INSERT INTO campaign_messages (campaign_id, content) VALUES ($1, $2)',
          [newCampaign.id, message]
        );
      }

      await client.query("COMMIT");
      const createdCampaign = await this.findById(newCampaign.id, true, true);
      return createdCampaign!;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async update(campaign: Partial<ICampaign>): Promise<ICampaign> {
    const { id, name, run_at, description, audienceIds, message } = campaign;

    if (!id) {
      throw new Error("Campaign ID is required to update a campaign.");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE campaigns
        SET
          name = $1,
          run_at = $2,
          description = $3
        WHERE id = $4
        RETURNING *`,
        [name, run_at, description, id]
      );

      if (audienceIds) {
        await client.query(
          "DELETE FROM campaign_audiences WHERE campaign_id = $1",
          [id]
        );
        if (audienceIds.length > 0) {
          const values = audienceIds
            .map((_, i) => `($1, $${i + 2})`)
            .join(", ");
          await client.query(
            `INSERT INTO campaign_audiences (campaign_id, audience_id) VALUES ${values}`,
            [id, ...audienceIds]
          );
        }
      }

      if (message) {
        await client.query('DELETE FROM campaign_messages WHERE campaign_id = $1', [id]);
        await client.query(
          'INSERT INTO campaign_messages (campaign_id, content) VALUES ($1, $2)',
          [id, message]
        );
      }

      await client.query("COMMIT");
      const updatedCampaign = await this.findById(id, true, true);
      return updatedCampaign!;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async list(
    offset: number,
    limit: number,
    includeAudiences = false,
    includeMessage = false
  ): Promise<ICampaign[]> {
    let query =
      "SELECT * FROM campaigns ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2";
    if (includeAudiences) {
      query = `
        SELECT c.*, array_agg(ca.audience_id) as audience_ids
        FROM campaigns c
        LEFT JOIN campaign_audiences ca ON c.id = ca.campaign_id
        GROUP BY c.id
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT $1 OFFSET $2
      `;
    }
    const result = await this.pool.query(query, [limit, offset]);

    const campaigns = await Promise.all(result.rows.map((d) => this.toCampaign(d, includeMessage)));
    return campaigns;
  }
}

export const campaignRepository = new CampaignRepository(pool);
