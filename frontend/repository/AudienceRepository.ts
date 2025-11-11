import { IAudience } from '../dto/IAudience';
import { IAudienceRepository } from './IAudienceRepository';
import { sql } from './db';

export class AudienceRepository implements IAudienceRepository {
  constructor(private sql: any) { }

  private toAudience(data: any): IAudience {
    if (!data) return data;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
    };
  }

  async findById(id: number): Promise<IAudience | null> {
    const result: any[] = await this.sql`SELECT * FROM audiences WHERE id = ${id}`;

    if (result.length === 0) {
      return null;
    }
    return this.toAudience(result[0]);
  }

  async findAll(): Promise<IAudience[]> {
    const result: any[] = await this.sql`SELECT * FROM audiences`;
    return result.map(this.toAudience);
  }

  async create(audience: Omit<IAudience, 'id' | 'created_at'>): Promise<IAudience> {
    const result: any[] = await this.sql`
      INSERT INTO audiences (name, description)
      VALUES (${audience.name}, ${audience.description})
      RETURNING *
    `;
    return this.toAudience(result[0]);
  }
}

export const audienceRepository = new AudienceRepository(sql);
