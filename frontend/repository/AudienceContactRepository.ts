import { Pool } from 'pg';
import { IContact } from './IContact';
import { IAudienceContactRepository } from './IAudienceContactRepository';
import { Contact } from './Contact';
import { pool } from './db';

export class AudienceContactRepository implements IAudienceContactRepository {
  constructor(private pool: Pool) {}

  private toContact(data: any): IContact {
    if (!data) return data;
    return new Contact(
      data.id,
      data.phone_number,
      data.lid,
      data.username,
      data.pushname,
      data.contact_name,
      data.is_user,
      data.created_at,
      data.updated_at
    );
  }

  async findByAudienceId(audienceId: number| BigInt): Promise<IContact[]> {
    const result = await this.pool.query(`
      SELECT c.*
      FROM contacts c
      JOIN audience_contacts ac ON c.id = ac.contact_id
      WHERE ac.audience_id = $1
    `, [audienceId]);
    return result.rows.map(this.toContact);
  }

  async addContactToAudience(audienceId: string, contactId: string): Promise<void> {
    await this.pool.query(`
      INSERT INTO audience_contacts (audience_id, contact_id)
      VALUES ($1, $2)
      ON CONFLICT (audience_id, contact_id) DO NOTHING
    `, [audienceId, contactId]);
  }

  async removeContactFromAudience(audienceId: string, contactId: string): Promise<void> {
    await this.pool.query(`
      DELETE FROM audience_contacts
      WHERE audience_id = $1 AND contact_id = $2
    `, [audienceId, contactId]);
  }

  async updateAudienceMembers(audienceId: string, contactIds: string[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing members for the audience
      await client.query(
        'DELETE FROM audience_contacts WHERE audience_id = $1',
        [audienceId]
      );

      // Insert new members
      if (contactIds.length > 0) {
        const valueStrings = [];
        const queryParams = [];
        let paramIndex = 1;
        for (const contactId of contactIds) {
          valueStrings.push(`($${paramIndex++}, $${paramIndex++})`);
          queryParams.push(audienceId);
          queryParams.push(contactId);
        }

        const queryText = `
          INSERT INTO audience_contacts (audience_id, contact_id)
          VALUES ${valueStrings.join(', ')}
          ON CONFLICT (audience_id, contact_id) DO NOTHING
        `;

        await client.query(queryText, queryParams);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

export const audienceContactRepository = new AudienceContactRepository(pool);
