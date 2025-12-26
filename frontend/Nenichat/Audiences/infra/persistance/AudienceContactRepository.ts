import { Pool } from 'pg';
import { IContact } from '@/Nenichat/Contacts/domain/IContact';
import { IAudienceContactRepository } from '../../domain/IAudienceContactRepository';
import { Contact } from '@/Nenichat/Contacts/domain/Contact';
import { pool } from '../../../Shared/infra/persistance/db';
import { IAudience } from '../../domain/IAudience';
import { Audience } from '../../domain/Audience';

export class AudienceContactRepository implements IAudienceContactRepository {
  constructor(private pool: Pool) { }

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

  async findByAudienceId(audienceId: number | BigInt): Promise<IContact[]> {
    const result = await this.pool.query(`
      SELECT c.*
      FROM contacts c
      JOIN audience_contacts ac ON c.id = ac.contact_id
      WHERE ac.audience_id = $1
    `, [audienceId]);
    return result.rows.map(this.toContact);
  }

  /*
  * Get contacts that are not in the audience
  * @param audienceId: number | BigInt
  * @returns Promise<IContact[]>
  */
  async findAvailableContacts(audienceId: number | BigInt): Promise<IContact[]> {
    const result = await this.pool.query(`
      SELECT c.*
      FROM contacts c
      LEFT JOIN audience_contacts ac ON c.id = ac.contact_id AND ac.audience_id = $1
      WHERE ac.contact_id IS NULL
      ORDER BY c.created_at DESC
    `, [audienceId]);
    return result.rows.map(this.toContact);
  }

  async findByContactId(contactId: number | BigInt): Promise<IAudience[]> {
    const result = await this.pool.query(`
      SELECT a.*
      FROM audiences a
      JOIN audience_contacts ac ON a.id = ac.audience_id
      WHERE ac.contact_id = $1
    `, [contactId]);
    return result.rows.map(this.toAudience);
  }

  private toAudience(data: any): IAudience {
    if (!data) return data;
    return new Audience(
      data.id,
      data.name,
      data.description,
      data.created_at,
    );
  }

  async addContactToAudiences(contactId: string, audiencesIds: string[]): Promise<void> {
    if (audiencesIds.length === 0) {
      return;
    }

    const valueStrings: string[] = [];
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    for (const audienceId of audiencesIds) {
      valueStrings.push(`($${paramIndex++}, $${paramIndex++})`);
      queryParams.push(audienceId);
      queryParams.push(contactId);
    }

    const queryText = `
      INSERT INTO audience_contacts (audience_id, contact_id)
      VALUES ${valueStrings.join(', ')}
      ON CONFLICT (audience_id, contact_id) DO NOTHING
    `;

    await this.pool.query(queryText, queryParams);
  }

  async removeContactFromAudience(audienceId: string, contactId: string): Promise<void> {
    await this.pool.query(`
      DELETE FROM audience_contacts
      WHERE audience_id = $1 AND contact_id = $2
    `, [audienceId, contactId]);
  }

  async addContactToAudience(audienceId: string, contactId: string): Promise<void> {
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
