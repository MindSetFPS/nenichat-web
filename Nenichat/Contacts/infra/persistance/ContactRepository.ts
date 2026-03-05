import { Pool, PoolClient } from 'pg';
import { IContact } from '../../domain/IContact';
import { IContactRepository } from '../../domain/IContactRepository';
import { Contact } from '../../domain/Contact';
import { pool } from '../../../Shared/infra/persistance/db';
import IContactWithLastMessage from '../../app/dtos/IContactWithLastMessage';
import { Message } from '@/Nenichat/Messages/domain/Message';

/**
 * SQL fragment that resolves the virtual `phone_number` string via JOIN.
 * All queries that return contact rows should use this instead of bare `contacts.*`.
 */
const CONTACT_COLUMNS = `
  c.id,
  c.business_id,
  c.phone_number_id,
  c.lid,
  c.username,
  c.pushname,
  c.contact_name,
  c.is_user,
  c.is_hidden,
  c.created_at,
  c.updated_at,
  pn.phone_number
`;

/**
 * Helper SELECT that returns a single contacts row by its primary key alias.
 * Suitable when the contacts table is already aliased as `c`.
 */
const FROM_CONTACTS_WITH_PHONE = `
  FROM contacts c
  LEFT JOIN phone_numbers pn ON pn.id = c.phone_number_id
`;

export class ContactRepository implements IContactRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Maps a query row to a Contact domain object.
   * Expects the row to include `phone_number` from the phone_numbers JOIN.
   */
  private mapRow(row: any): Contact {
    return new Contact(
      row.id,
      row.business_id,
      row.phone_number_id ?? null,
      row.phone_number ?? null,  // resolved from JOIN
      row.lid,
      row.username,
      row.pushname,
      row.contact_name,
      row.is_user,
      row.is_hidden || false,
      row.created_at,
      row.updated_at
    );
  }

  /**
   * Looks up or creates a row in the global `phone_numbers` table.
   * @param client An active pg PoolClient (to participate in a transaction).
   * @param phoneNumber The phone number string.
   * @returns The id of the phone_numbers row.
   */
  private async getOrCreatePhoneNumberId(client: PoolClient | Pool, phoneNumber: string): Promise<number> {
    const result = await (client as any).query(
      `INSERT INTO phone_numbers (phone_number)
       VALUES ($1)
       ON CONFLICT (phone_number) DO UPDATE SET phone_number = EXCLUDED.phone_number
       RETURNING id`,
      [phoneNumber]
    );
    return result.rows[0].id;
  }

  public async findById(businessId: number, id: number): Promise<IContact | null> {
    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
       WHERE c.id = $1 AND c.business_id = $2`,
      [id, businessId]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  public async findByPhoneNumber(businessId: number, phoneNumber: string): Promise<IContact | null> {
    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
       WHERE c.business_id = $1 AND pn.phone_number = $2`,
      [businessId, phoneNumber]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  public async findByLid(businessId: number, lid: string): Promise<IContact | null> {
    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
       WHERE c.business_id = $1 AND c.lid = $2`,
      [businessId, lid]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  public async findMe(businessId: number): Promise<IContact | null> {
    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
       WHERE c.business_id = $1 AND c.is_user = TRUE LIMIT 1`,
      [businessId]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  public async save(contact: Partial<IContact>): Promise<IContact> {
    if (!contact.business_id && !contact.id) {
      throw new Error("Business ID is required for creating a contact");
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Resolve phone_number_id from the global table when a phone string is provided.
      let phoneNumberId: number | null = contact.phone_number_id ?? null;
      if (!phoneNumberId && contact.phone_number) {
        phoneNumberId = await this.getOrCreatePhoneNumberId(client, contact.phone_number);
      }

      // Try to find an existing contact row to update.
      let existingContact: IContact | null = null;
      if (contact.business_id && (phoneNumberId || contact.lid)) {
        if (phoneNumberId) {
          const res = await client.query(
            `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
             WHERE c.business_id = $1 AND c.phone_number_id = $2`,
            [contact.business_id, phoneNumberId]
          );
          if (res.rows.length > 0) existingContact = this.mapRow(res.rows[0]);
        }
        if (!existingContact && contact.lid) {
          const res = await client.query(
            `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
             WHERE c.business_id = $1 AND c.lid = $2`,
            [contact.business_id, contact.lid]
          );
          if (res.rows.length > 0) existingContact = this.mapRow(res.rows[0]);
        }
      }

      let row: any;
      if (existingContact?.id) {
        const merged = { ...existingContact, ...contact };
        const result = await client.query(
          `UPDATE contacts
           SET phone_number_id = $1, lid = $2, username = $3, pushname = $4,
               contact_name = $5, is_user = $6, updated_at = NOW()
           WHERE id = $7
           RETURNING *`,
          [
            phoneNumberId,
            merged.lid,
            merged.username,
            merged.pushname,
            merged.contact_name,
            merged.is_user,
            existingContact.id,
          ]
        );
        row = result.rows[0];
      } else {
        const result = await client.query(
          `INSERT INTO contacts
             (business_id, phone_number_id, lid, username, pushname, contact_name, is_user)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            contact.business_id,
            phoneNumberId,
            contact.lid ?? null,
            contact.username ?? null,
            contact.pushname ?? null,
            contact.contact_name ?? null,
            contact.is_user ?? false,
          ]
        );
        row = result.rows[0];
      }

      await client.query('COMMIT');

      // Re-fetch with JOIN to populate virtual phone_number field.
      const fetched = await this.findById(row.business_id, row.id);
      return fetched!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async saveBatch(contacts: Partial<IContact>[]): Promise<void> {
    if (contacts.length === 0) return;
    for (const contact of contacts) {
      await this.save(contact);
    }
  }

  public async list(businessId: number, offset: number, limit: number): Promise<IContact[]> {
    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
       WHERE c.business_id = $1
       ORDER BY c.created_at DESC LIMIT $2 OFFSET $3`,
      [businessId, limit, offset]
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  public async search(businessId: number, query: string, limit: number): Promise<IContact[]> {
    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
       WHERE c.business_id = $1
         AND (pn.phone_number ILIKE $2 OR c.lid ILIKE $2 OR c.contact_name ILIKE $2 OR c.pushname ILIKE $2)
       ORDER BY c.created_at DESC LIMIT $3`,
      [businessId, `%${query}%`, limit]
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  public async findMergeCandidates(businessId: number, offset: number, limit: number): Promise<{ contacts: IContact[]; total: number }> {
    const countResult = await this.pool.query(
      `SELECT COUNT(*)
       FROM contacts c ${FROM_CONTACTS_WITH_PHONE.replace('FROM contacts c', '')}
       WHERE c.business_id = $1 AND (c.phone_number_id IS NULL OR c.lid IS NULL)`,
      [businessId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
       WHERE c.business_id = $1 AND (c.phone_number_id IS NULL OR c.lid IS NULL)
       ORDER BY c.created_at DESC LIMIT $2 OFFSET $3`,
      [businessId, limit, offset]
    );

    return { contacts: result.rows.map((r) => this.mapRow(r)), total };
  }

  public async getOrCreateContact(businessId: number, contactId: string): Promise<IContact> {
    const isLid = contactId.endsWith('@lid') || !contactId.startsWith('521');

    let contact: IContact | null = null;
    if (isLid) {
      contact = await this.findByLid(businessId, contactId);
    }
    if (!contact && !isLid) {
      contact = await this.findByPhoneNumber(businessId, contactId);
    }
    if (contact) return contact;

    const newContactData: Partial<IContact> = { business_id: businessId, is_user: false };
    if (isLid) {
      newContactData.lid = contactId;
    } else {
      newContactData.phone_number = contactId;
    }
    return this.save(newContactData);
  }

  public async setMe(businessId: number, userId: number): Promise<IContact> {
    const contactToSet = await this.findById(businessId, userId);
    if (!contactToSet) throw new Error(`Contact with ID ${userId} not found.`);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE contacts SET is_user = FALSE WHERE business_id = $1 AND is_user = TRUE',
        [businessId]
      );
      await client.query('UPDATE contacts SET is_user = TRUE WHERE id = $1', [userId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const updated = await this.findById(businessId, userId);
    return updated!;
  }

  public async mergeContacts(businessId: number, primaryContactId: number, secondaryContactIds: number[]): Promise<void> {
    if (!primaryContactId || secondaryContactIds.length === 0) {
      throw new Error('Primary contact ID and at least one secondary contact ID are required.');
    }
    if (secondaryContactIds.includes(primaryContactId)) {
      throw new Error('Primary contact ID cannot be present in secondary contact IDs.');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const primaryContact = await this.findById(businessId, primaryContactId);
      if (!primaryContact) throw new Error(`Primary contact with ID ${primaryContactId} not found.`);

      const secondaryContacts: IContact[] = [];
      for (const id of secondaryContactIds) {
        const c = await this.findById(businessId, id);
        if (!c) throw new Error(`Secondary contact with ID ${id} not found.`);
        secondaryContacts.push(c);
      }

      const secondaryIdsArray = `{${secondaryContactIds.join(',')}}`;

      await client.query('UPDATE audience_contacts SET contact_id = $1 WHERE contact_id = ANY($2::bigint[])', [primaryContactId, secondaryIdsArray]);
      await client.query('UPDATE messages SET sender_id = $1 WHERE sender_id = ANY($2::bigint[])', [primaryContactId, secondaryIdsArray]);
      await client.query('UPDATE messages SET chat_id = $1 WHERE chat_id = ANY($2::bigint[])', [primaryContactId, secondaryIdsArray]);
      await client.query('UPDATE recipients SET contact_id = $1 WHERE contact_id = ANY($2::bigint[])', [primaryContactId, secondaryIdsArray]);

      let mergedPhoneNumberId = primaryContact.phone_number_id;
      let mergedLid = primaryContact.lid;
      let mergedUsername = primaryContact.username;
      let mergedPushname = primaryContact.pushname;
      let mergedContactName = primaryContact.contact_name;
      let mergedIsUser = primaryContact.is_user;
      let mergedCreatedAt = primaryContact.created_at;

      for (const sec of secondaryContacts) {
        if (!mergedPhoneNumberId && sec.phone_number_id) mergedPhoneNumberId = sec.phone_number_id;
        if (!mergedLid && sec.lid) mergedLid = sec.lid;
        if (!mergedUsername && sec.username) mergedUsername = sec.username;
        if (!mergedPushname && sec.pushname) mergedPushname = sec.pushname;
        if (!mergedContactName && sec.contact_name) mergedContactName = sec.contact_name;
        if (sec.is_user) mergedIsUser = true;
        if (sec.created_at < mergedCreatedAt) mergedCreatedAt = sec.created_at;
      }

      await client.query('DELETE FROM contacts WHERE id = ANY($1::bigint[])', [secondaryIdsArray]);

      await client.query(
        `UPDATE contacts
         SET phone_number_id = $1, lid = $2, username = $3, pushname = $4,
             contact_name = $5, is_user = $6, created_at = $7, updated_at = NOW()
         WHERE id = $8`,
        [mergedPhoneNumberId, mergedLid, mergedUsername, mergedPushname, mergedContactName, mergedIsUser, mergedCreatedAt, primaryContactId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findRecentContacts(businessId: number, limit: number): Promise<IContact[]> {
    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS}
       FROM contacts c
       LEFT JOIN phone_numbers pn ON pn.id = c.phone_number_id
       JOIN messages m ON c.id = m.sender_id
       WHERE c.business_id = $1
       GROUP BY c.id, pn.phone_number
       ORDER BY MAX(m.created_at) DESC
       LIMIT $2`,
      [businessId, limit]
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  public async getContactsWithLastMessage(businessId: number, offset: number, limit: number): Promise<IContactWithLastMessage[]> {
    const result = await this.pool.query(
      `SELECT
        c.id AS contact_id,
        c.business_id,
        c.phone_number_id,
        c.lid,
        c.username,
        c.pushname,
        c.contact_name,
        c.is_user,
        c.is_hidden,
        c.created_at AS contact_created_at,
        c.updated_at AS contact_updated_at,
        pn.phone_number,
        m.id AS message_id,
        m.chat_id,
        m.sender_id,
        m.text_content,
        m.timestamp,
        m.is_from_me,
        m.media_type,
        m.filename,
        m.url,
        m.file_length,
        m.replied_to_message_id,
        m.quoted_message_text,
        m.created_at AS message_created_at,
        m.updated_at AS message_updated_at
       FROM contacts c
       LEFT JOIN phone_numbers pn ON pn.id = c.phone_number_id
       JOIN (
           SELECT
               id, chat_id, sender_id, text_content, timestamp, is_from_me, media_type, filename, url, file_length,
               replied_to_message_id, quoted_message_text, created_at, updated_at,
               ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY created_at DESC) AS rn
           FROM messages
       ) m ON c.id = m.chat_id
       WHERE m.rn = 1
         AND c.business_id = $1
         AND c.is_hidden = FALSE
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [businessId, limit, offset]
    );

    return result.rows.map((row) => {
      const contact: IContact = new Contact(
        row.contact_id,
        row.business_id,
        row.phone_number_id ?? null,
        row.phone_number ?? null,
        row.lid,
        row.username,
        row.pushname,
        row.contact_name,
        row.is_user,
        row.is_hidden || false,
        row.contact_created_at,
        row.contact_updated_at
      );

      const lastMessage = new Message(
        row.message_id,
        row.chat_id,
        row.sender_id,
        row.text_content,
        row.timestamp,
        row.is_from_me,
        row.media_type,
        row.filename,
        row.url,
        row.file_length,
        row.message_created_at,
        row.message_updated_at,
        row.replied_to_message_id,
        row.quoted_message_text
      );

      return { ...contact, last_message: lastMessage };
    });
  }

  public async hideContact(businessId: number, contactIdToHide: number): Promise<void> {
    const contactToHide = await this.findById(businessId, contactIdToHide);
    if (!contactToHide) throw new Error("Contact not found");
    await this.pool.query('UPDATE contacts SET is_hidden = TRUE WHERE id = $1', [contactIdToHide]);
  }

  public async getHiddenContacts(businessId: number, offset: number, limit: number): Promise<IContact[]> {
    const result = await this.pool.query(
      `SELECT ${CONTACT_COLUMNS} ${FROM_CONTACTS_WITH_PHONE}
       WHERE c.business_id = $1 AND c.is_hidden = TRUE LIMIT $2 OFFSET $3`,
      [businessId, limit, offset]
    );
    return result.rows.map((r) => this.mapRow(r));
  }

  public async isContactHidden(businessId: number, contactId: number): Promise<boolean> {
    const contact = await this.findById(businessId, contactId);
    if (!contact) return false;
    return contact.is_hidden;
  }

  public async unhideContact(businessId: number, contactIdToUnhide: number): Promise<void> {
    const contactToUnhide = await this.findById(businessId, contactIdToUnhide);
    if (!contactToUnhide) return;
    await this.pool.query('UPDATE contacts SET is_hidden = FALSE WHERE id = $1', [contactIdToUnhide]);
  }

  public async count(businessId: number): Promise<number> {
    const result = await this.pool.query(
      'SELECT COUNT(*) FROM contacts WHERE business_id = $1',
      [businessId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

export const contactRepository = new ContactRepository(pool);