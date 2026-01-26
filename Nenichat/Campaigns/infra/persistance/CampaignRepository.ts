import { Pool } from "pg";
import { ICampaign } from "../../domain/ICampaign";
import { ICampaignRepository } from "../../domain/ICampaignRepository";
import { Campaign } from "../../domain/Campaign";
import { pool } from "../../../Shared/infra/persistance/db";
import { CronExpressionParser } from 'cron-parser';

export class CampaignRepository implements ICampaignRepository {
  constructor(private pool: Pool) { }

  private async toCampaign(data: any): Promise<ICampaign> {
    if (!data) return data;
    const payload = data.payload || {};

    // Extract campaign specific fields from payload
    const {
      message,
      audienceIds,
      interval,
      day_of_month,
      day_of_week
    } = payload;

    const campaign = new Campaign(
      data.id,
      data.name,
      data.created_at,
      data.updated_at,
      data.frequency_type,
      payload,
      data.enabled,
      interval,
      day_of_month,
      day_of_week,
      data.cron_expression,
      data.run_at,
      undefined, // executed_at removed from usage
      data.description,
      message,
      audienceIds ? audienceIds.map(Number) : undefined
    );

    return campaign;
  }

  async findById(
    id: string,
    _includeAudiences = false,
    _includeMessage = false
  ): Promise<ICampaign | null> {
    const query = "SELECT * FROM scheduled_tasks WHERE id = $1 AND task_type = 'message-campaign'";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }
    return await this.toCampaign(result.rows[0]);
  }

  async create(campaign: Partial<ICampaign>): Promise<ICampaign> {
    const {
      name,
      run_at,
      description,
      audienceIds,
      message,
      frequency_type,
      payload,
      enabled,
      interval,
      day_of_month,
      day_of_week
    } = campaign;

    if (!name) {
      throw new Error("Campaign name is required to create a campaign.");
    }
    if (!frequency_type) {
      throw new Error("Campaign frequency_type is required to create a campaign.");
    }

    // Merge campaign fields into payload
    const finalPayload = {
      ...(payload || {}),
      message,
      audienceIds,
      interval,
      day_of_month,
      day_of_week
    };

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO scheduled_tasks (
          name, 
          run_at, 
          description, 
          frequency_type, 
          payload, 
          enabled,
          task_type
        ) VALUES ($1, $2, $3, $4, $5, $6, 'campaign') RETURNING *`,
        [
          name,
          run_at || null,
          description || null,
          frequency_type,
          finalPayload,
          enabled ?? true
        ]
      );

      const newCampaign = result.rows[0];
      await client.query("COMMIT");

      return await this.toCampaign(newCampaign);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async update(campaign: Partial<ICampaign>): Promise<ICampaign> {
    const {
      id,
      name,
      run_at,
      description,
      audienceIds,
      message,
      frequency_type,
      payload,
      enabled,
      interval,
      day_of_month,
      day_of_week
    } = campaign;

    if (!id) {
      throw new Error("Campaign ID is required to update a campaign.");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const existingResult = await client.query("SELECT * FROM scheduled_tasks WHERE id = $1 FOR UPDATE", [id]);
      if (existingResult.rows.length === 0) {
        throw new Error(`Campaign with id ${id} not found`);
      }
      const existing = existingResult.rows[0];
      const existingPayload = existing.payload || {};

      const newPayload = {
        ...existingPayload,
        ...(payload || {}), // Overwrite with any explicit payload passed
      };

      // Update specific fields in payload if they are provided in campaign
      if (message !== undefined) newPayload.message = message;
      if (audienceIds !== undefined) newPayload.audienceIds = audienceIds;
      if (interval !== undefined) newPayload.interval = interval;
      if (day_of_month !== undefined) newPayload.day_of_month = day_of_month;
      if (day_of_week !== undefined) newPayload.day_of_week = day_of_week;

      // Recalculate cron_expression and next_run_at if scheduling data changed
      const currentFrequencyType = frequency_type || existing.frequency_type;
      const currentRunAt = run_at || (existing.run_at ? new Date(existing.run_at) : new Date());
      const currentInterval = interval !== undefined ? interval : newPayload.interval;
      const currentDayOfMonth = day_of_month !== undefined ? day_of_month : newPayload.day_of_month;
      const currentDayOfWeek = day_of_week !== undefined ? day_of_week : newPayload.day_of_week;

      let cronExpression = existing.cron_expression;
      let nextRunAt = existing.next_run_at;

      if (currentFrequencyType === 'recurring') {
        const hour = currentRunAt.getHours();
        const minute = currentRunAt.getMinutes();

        if (currentInterval === 'daily') {
          cronExpression = `${minute} ${hour} * * *`;
        } else if (currentInterval === 'weekly') {
          cronExpression = `${minute} ${hour} * * ${currentDayOfWeek}`;
        } else if (currentInterval === 'monthly') {
          cronExpression = `${minute} ${hour} ${currentDayOfMonth} * *`;
        }

        try {
          const cronInterval = CronExpressionParser.parse(cronExpression);
          nextRunAt = cronInterval.next().toDate();
        } catch (e) {
          console.error('Failed to parse cron expression:', cronExpression, e);
        }
      } else if (currentFrequencyType === 'once') {
        cronExpression = null;
        nextRunAt = currentRunAt;
      }

      const result = await client.query(
        `UPDATE scheduled_tasks
        SET
          name = COALESCE($1, name),
          run_at = COALESCE($2, run_at),
          description = COALESCE($3, description),
          frequency_type = COALESCE($4, frequency_type),
          payload = $5,
          enabled = COALESCE($6, enabled),
          cron_expression = $7,
          next_run_at = $8,
          updated_at = NOW()
        WHERE id = $9
        RETURNING *`,
        [
          name,
          run_at,
          description,
          frequency_type,
          newPayload,
          enabled,
          cronExpression,
          nextRunAt,
          id
        ]
      );

      await client.query("COMMIT");
      return await this.toCampaign(result.rows[0]);
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
    _includeAudiences = false,
    _includeMessage = false
  ): Promise<ICampaign[]> {
    const query =
      "SELECT * FROM scheduled_tasks WHERE task_type = 'message-campaign' ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2";

    const result = await this.pool.query(query, [limit, offset]);
    const campaigns = await Promise.all(result.rows.map((d) => this.toCampaign(d)));
    console.log(campaigns)
    return campaigns;
  }
}

export const campaignRepository = new CampaignRepository(pool);
