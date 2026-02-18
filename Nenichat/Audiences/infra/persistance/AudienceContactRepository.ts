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
      data.business_id,
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

  async findByAudienceId(businessId: number, audienceId: number): Promise<IContact[]> {
    const result = await this.pool.query(`
      SELECT c.*
      FROM contacts c
      JOIN audience_contacts ac ON c.id = ac.contact_id
      WHERE ac.audience_id = $1 AND c.business_id = $2
    `, [audienceId, businessId]);
    return result.rows.map(this.toContact);
  }

  async findAvailableContacts(businessId: number, audienceId: number): Promise<IContact[]> {
    const result = await this.pool.query(`
      SELECT c.*
      FROM contacts c
      LEFT JOIN audience_contacts ac ON c.id = ac.contact_id AND ac.audience_id = $1
      WHERE ac.contact_id IS NULL AND c.business_id = $2
      ORDER BY c.created_at DESC
    `, [audienceId, businessId]);
    return result.rows.map(this.toContact);
  }

  async findByContactId(businessId: number, contactId: number): Promise<IAudience[]> {
    const result = await this.pool.query(`
      SELECT a.*
      FROM audiences a
      JOIN audience_contacts ac ON a.id = ac.audience_id
      WHERE ac.contact_id = $1 AND a.business_id = $2
    `, [contactId, businessId]);
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

  async addContactToAudience(businessId: number, audienceId: number, contactId: number): Promise<void> {
    // Verify business ownership
    const checkQuery = `
        SELECT 1 FROM audiences a
        JOIN contacts c ON c.business_id = a.business_id
        WHERE a.id = $1 AND c.id = $2 AND a.business_id = $3
    `;
    const check = await this.pool.query(checkQuery, [audienceId, contactId, businessId]);
    if (check.rows.length === 0) throw new Error("Unauthorized or invalid audience/contact");

    const queryText = `
      INSERT INTO audience_contacts (audience_id, contact_id)
      VALUES ($1, $2)
      ON CONFLICT (audience_id, contact_id) DO NOTHING
    `;

    await this.pool.query(queryText, [audienceId, contactId]);
  }

  async removeContactFromAudience(businessId: number, audienceId: number, contactId: number): Promise<void> {
    // Verify business ownership via subquery or join
    await this.pool.query(`
      DELETE FROM audience_contacts
      WHERE audience_id = $1 AND contact_id = $2
      AND EXISTS (SELECT 1 FROM audiences WHERE id = $1 AND business_id = $3)
    `, [audienceId, contactId, businessId]);
  }

  async delete(businessId: number, audienceId: number): Promise<void> {
    await this.pool.query(`
      DELETE FROM audience_contacts
      WHERE audience_id = $1
      AND EXISTS (SELECT 1 FROM audiences WHERE id = $1 AND business_id = $2)
    `, [audienceId, businessId]);
  }

  async updateAudienceMembers(businessId: number, audienceId: number, contactIds: number[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Verify audience belongs to business
      const auth = await client.query('SELECT 1 FROM audiences WHERE id = $1 AND business_id = $2', [audienceId, businessId]);
      if (auth.rows.length === 0) throw new Error("Unauthorized");

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
