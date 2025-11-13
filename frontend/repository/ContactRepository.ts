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
}

export const contactRepository = new ContactRepository(pool);