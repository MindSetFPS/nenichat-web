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

  async findById(id: number): Promise<IAudience | null> {
    const result = await this.pool.query('SELECT * FROM audiences WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return null;
    }
    return this.toAudience(result.rows[0]);
  }

  async getByIds(ids: number[]): Promise<IAudience[]> {
    const result = await this.pool.query('SELECT * FROM audiences WHERE id = ANY($1)', [ids]);
    return result.rows.map(this.toAudience);
  }

  async findAll(): Promise<IAudience[]> {
    const result = await this.pool.query('SELECT * FROM audiences');
    return result.rows.map(this.toAudience);
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM audiences WHERE id = $1', [id]);
  }

  async create(audience: Omit<IAudience, 'id' | 'created_at'>): Promise<IAudience> {
    const result = await this.pool.query(
      `
      INSERT INTO audiences (name, description)
      VALUES ($1, $2)
      RETURNING *
    `,
      [audience.name, audience.description]
    );
    return this.toAudience(result.rows[0]);
  }
}

export const audienceRepository = new AudienceRepository(pool);
