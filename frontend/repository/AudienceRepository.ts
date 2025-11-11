import { IAudienceRepository } from './IAudienceRepository';
import { IAudience } from '../dto/IAudience';
import { sql } from './db';

export class AudienceRepository implements IAudienceRepository {
    constructor(private sql: any) { }

    async create(audience: IAudience): Promise<IAudience> {
        const result = await this.sql`
            INSERT INTO audiences (name, description, created_at)
            VALUES (${audience.name}, ${audience.description}, ${audience.created_at})
            RETURNING id, name, description, created_at;
        `.execute();
        return result.rows[0] as IAudience;
    }

    async findById(id: number): Promise<IAudience | null> {
        const result = await this.sql`
            SELECT id, name, description, created_at
            FROM audiences
            WHERE id = ${id};
        `.execute();
        return result.rows[0] ? (result.rows[0] as IAudience) : null;
    }

    async findAll(): Promise<IAudience[]> {
        const result = await this.sql`
            SELECT id, name, description, created_at
            FROM audiences;
        `.execute();
        console.log(result)
        return result as IAudience[];
    }

    async update(audience: IAudience): Promise<IAudience> {
        const result = await this.sql`
            UPDATE audiences
            SET name = ${audience.name}, description = ${audience.description}, created_at = ${audience.created_at}
            WHERE id = ${audience.id}
            RETURNING id, name, description, created_at;
        `.execute();
        return result.rows[0] as IAudience;
    }

    async delete(id: number): Promise<void> {
        await this.sql`
            DELETE FROM audiences
            WHERE id = ${id};
        `.execute();
    }

    async search(query: string): Promise<IAudience[]> {
        const result = await this.sql`
            SELECT id, name, description, created_at
            FROM audiences
            WHERE name ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`};
        `.execute();
        return result.rows as IAudience[];
    }
}

export const audienceRepository = new AudienceRepository(sql);