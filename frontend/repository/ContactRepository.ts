import { Pool } from 'pg';
import { IContact } from './IContact';
import { IContactRepository } from './IContactRepository';
import { Contact } from './Contact';
import { pool } from '../repository/db';

export class ContactRepository implements IContactRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async findById(id: bigint): Promise<IContact | null> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.phone_number,
      row.lid,
      row.username,
      row.pushname,
      row.contact_name,
      row.is_user,
      row.created_at,
      row.updated_at
    );
  }

  public async findByPhoneNumber(phoneNumber: string): Promise<IContact | null> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE phone_number = $1', [
      phoneNumber,
    ]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.phone_number,
      row.lid,
      row.username,
      row.pushname,
      row.contact_name,
      row.is_user,
      row.created_at,
      row.updated_at
    );
  }

  public async findByLid(lid: string): Promise<IContact | null> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE lid = $1', [lid]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.phone_number,
      row.lid,
      row.username,
      row.pushname,
      row.contact_name,
      row.is_user,
      row.created_at,
      row.updated_at
    );
  }

  public async findMe(): Promise<IContact | null> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE is_user = TRUE LIMIT 1');
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.phone_number,
      row.lid,
      row.username,
      row.pushname,
      row.contact_name,
      row.is_user,
      row.created_at,
      row.updated_at
    );
  }

  public async save(contact: Partial<IContact>): Promise<IContact> {
    if (contact.phone_number || contact.lid) {
      let existingContact;
      if (contact.phone_number) {
        existingContact = await this.findByPhoneNumber(contact.phone_number);
      }
      if (!existingContact && contact.lid) {
        existingContact = await this.findByLid(contact.lid);
      }

      if (existingContact && existingContact.id) {
        // Update
        const newContact = { ...existingContact, ...contact };
        const result = await this.pool.query(
          'UPDATE contacts SET phone_number = $1, lid = $2, username = $3, pushname = $4, contact_name = $5, is_user = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
          [
            newContact.phone_number,
            newContact.lid,
            newContact.username,
            newContact.pushname,
            newContact.contact_name,
            newContact.is_user,
            existingContact.id,
          ]
        );
        const row = result.rows[0];
        return new Contact(
          row.id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.created_at,
          row.updated_at
        );
      }
    }

    // Create
    const result = await this.pool.query(
      'INSERT INTO contacts (phone_number, lid, username, pushname, contact_name, is_user) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        contact.phone_number,
        contact.lid,
        contact.username,
        contact.pushname,
        contact.contact_name,
        contact.is_user,
      ]
    );
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.phone_number,
      row.lid,
      row.username,
      row.pushname,
      row.contact_name,
      row.is_user,
      row.created_at,
      row.updated_at
    );
  }

  public async list(offset: number, limit: number): Promise<IContact[]> {
    const result = await this.pool.query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2', [
      limit,
      offset,
    ]);
    return result.rows.map(
      (row) =>
        new Contact(
          row.id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.created_at,
          row.updated_at
        )
    );
  }

  public async search(query: string, limit = 10): Promise<IContact[]> {
    const result = await this.pool.query(
      "SELECT * FROM contacts WHERE phone_number ILIKE $1 OR lid ILIKE $1 ORDER BY created_at DESC LIMIT $2",
      [`%${query}%`, limit]
    );
    return result.rows.map(
      (row) =>
        new Contact(
          row.id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.created_at,
          row.updated_at
        )
    );
  }

  public async findMergeCandidates(): Promise<IContact[]> {
    const result = await this.pool.query(
      'SELECT * FROM contacts WHERE phone_number IS NULL OR lid IS NULL ORDER BY created_at DESC'
    );
    return result.rows.map(
      (row) =>
        new Contact(
          row.id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.created_at,
          row.updated_at
        )
    );
  }

  public async mergeContacts(primaryContactId: bigint, secondaryContactIds: bigint[]): Promise<void> {
    if (!primaryContactId || secondaryContactIds.length === 0) {
      throw new Error('Primary contact ID and at least one secondary contact ID are required for merging.');
    }
    if (secondaryContactIds.includes(primaryContactId)) {
      throw new Error('Primary contact ID cannot be present in secondary contact IDs.');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const primaryContact = await this.findById(primaryContactId);
      if (!primaryContact) {
        throw new Error(`Primary contact with ID ${primaryContactId} not found.`);
      }

      const secondaryContacts: IContact[] = [];
      for (const id of secondaryContactIds) {
        const contact = await this.findById(id);
        if (!contact) {
          throw new Error(`Secondary contact with ID ${id} not found.`);
        }
        secondaryContacts.push(contact);
      }

      // 1. Update foreign key references
      const secondaryIdsArray = `{${secondaryContactIds.join(',')}}`;

      // Update audience_contacts
      await client.query(
        'UPDATE audience_contacts SET contact_id = $1 WHERE contact_id = ANY($2::bigint[])',
        [primaryContactId, secondaryIdsArray]
      );

      // Update messages (sender_id)
      await client.query(
        'UPDATE messages SET sender_id = $1 WHERE sender_id = ANY($2::bigint[])',
        [primaryContactId, secondaryIdsArray]
      );

      // Update messages (chat_id) - messages from secondary chats move to primary chat
      await client.query(
        'UPDATE messages SET chat_id = $1 WHERE chat_id = ANY($2::bigint[])',
        [primaryContactId, secondaryIdsArray]
      );

      // Update recipients
      await client.query(
        'UPDATE recipients SET contact_id = $1 WHERE contact_id = ANY($2::bigint[])',
        [primaryContactId, secondaryIdsArray]
      );

      // 2. Merge contact data into primary contact
      let mergedPhoneNumber = primaryContact.phone_number;
      let mergedLid = primaryContact.lid;
      let mergedUsername = primaryContact.username;
      let mergedPushname = primaryContact.pushname;
      let mergedContactName = primaryContact.contact_name;
      let mergedIsUser = primaryContact.is_user;
      let mergedCreatedAt = primaryContact.created_at;
      let mergedUpdatedAt = primaryContact.updated_at;

      for (const secondary of secondaryContacts) {
        if (!mergedPhoneNumber && secondary.phone_number) {
          mergedPhoneNumber = secondary.phone_number;
        }
        if (!mergedLid && secondary.lid) {
          mergedLid = secondary.lid;
        }
        if (!mergedUsername && secondary.username) {
          mergedUsername = secondary.username;
        }
        if (!mergedPushname && secondary.pushname) {
          mergedPushname = secondary.pushname;
        }
        if (!mergedContactName && secondary.contact_name) {
          mergedContactName = secondary.contact_name;
        }
        if (secondary.is_user) {
          mergedIsUser = true;
        }
        if (secondary.created_at < mergedCreatedAt) {
          mergedCreatedAt = secondary.created_at;
        }
        if (secondary.updated_at > mergedUpdatedAt) {
          mergedUpdatedAt = secondary.updated_at;
        }
      }

      // Update the primary contact with merged data
      await client.query(
        `UPDATE contacts
         SET phone_number = $1, lid = $2, username = $3, pushname = $4, contact_name = $5, is_user = $6, created_at = $7, updated_at = NOW()
         WHERE id = $8`,
        [
          mergedPhoneNumber,
          mergedLid,
          mergedUsername,
          mergedPushname,
          mergedContactName,
          mergedIsUser,
          mergedCreatedAt,
          primaryContactId,
        ]
      );

      // 3. Delete secondary contacts
      await client.query(
        'DELETE FROM contacts WHERE id = ANY($1::bigint[])',
        [secondaryIdsArray]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const contactRepository = new ContactRepository(pool);