import { Pool } from 'pg';
import { IAudience } from '../../domain/IAudience';
import { IAudienceRepository } from '../../domain/IAudienceRepository';
import { pool } from '../../../Shared/infra/persistance/db';

export class AudienceRepository implements IAudienceRepository {
  constructor(private pool: Pool) { }

  private toAudience(data: any): IAudience {
    if (!data) return data;
    return {
      id: Number(data.id),
      name: data.name,
      description: data.description,
      created_at: data.created_at,
    };
  }

  async findById(businessId: number, id: number): Promise<IAudience | null> {
    const result = await this.pool.query('SELECT * FROM audiences WHERE id = $1 AND business_id = $2', [id, businessId]);

    if (result.rows.length === 0) {
      return null;
    }
    return this.toAudience(result.rows[0]);
  }

  async getByIds(businessId: number, ids: number[]): Promise<IAudience[]> {
    const result = await this.pool.query('SELECT * FROM audiences WHERE id = ANY($1) AND business_id = $2', [ids, businessId]);
    return result.rows.map(this.toAudience);
  }

  async findAll(businessId: number): Promise<IAudience[]> {
    const result = await this.pool.query('SELECT * FROM audiences WHERE business_id = $1', [businessId]);
    return result.rows.map(this.toAudience);
  }

  async delete(businessId: number, id: number): Promise<void> {
    await this.pool.query('DELETE FROM audiences WHERE id = $1 AND business_id = $2', [id, businessId]);
  }

  async create(businessId: number, audience: Omit<IAudience, 'id' | 'business_id' | 'created_at'>): Promise<IAudience> {
    const result = await this.pool.query(
      `
      INSERT INTO audiences (name, description, business_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [audience.name, audience.description, businessId]
    );
    return this.toAudience(result.rows[0]);
  }
}

export const audienceRepository = new AudienceRepository(pool);
