import { Pool } from 'pg';
import { IContact } from '../../domain/IContact';
import { IContactRepository } from '../../domain/IContactRepository';
import { Contact } from '../../domain/Contact';
import { pool } from '../../../Shared/infra/persistance/db';
import IContactWithLastMessage from '../../app/dtos/IContactWithLastMessage';
import { IMessage } from '@/Nenichat/Messages/domain/IMessage';
import { Message } from '@/Nenichat/Messages/domain/Message';

export class ContactRepository implements IContactRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async findById(businessId: number, id: number): Promise<IContact | null> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE id = $1 AND business_id = $2', [id, businessId]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.business_id,
      row.phone_number,
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

  public async findByPhoneNumber(businessId: number, phoneNumber: string): Promise<IContact | null> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE business_id = $1 AND phone_number = $2', [
      businessId,
      phoneNumber,
    ]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.business_id,
      row.phone_number,
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

  public async findByLid(businessId: number, lid: string): Promise<IContact | null> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE business_id = $1 AND lid = $2', [businessId, lid]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.business_id,
      row.phone_number,
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

  public async findMe(businessId: number): Promise<IContact | null> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE business_id = $1 AND is_user = TRUE LIMIT 1', [businessId]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Contact(
      row.id,
      row.business_id,
      row.phone_number,
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

  public async save(contact: Partial<IContact>): Promise<IContact> {
    if (!contact.business_id && !contact.id) {
      throw new Error("Business ID is required for creating a contact");
    }

    if (contact.business_id && (contact.phone_number || contact.lid)) {
      let existingContact;
      if (contact.phone_number) {
        existingContact = await this.findByPhoneNumber(contact.business_id, contact.phone_number);
      }
      if (!existingContact && contact.lid) {
        existingContact = await this.findByLid(contact.business_id, contact.lid);
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
          row.business_id,
          row.phone_number,
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
    }

    // Create
    const result = await this.pool.query(
      'INSERT INTO contacts (business_id, phone_number, lid, username, pushname, contact_name, is_user) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        contact.business_id,
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
      row.business_id,
      row.phone_number,
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

  public async saveBatch(contacts: Partial<IContact>[]): Promise<void> {
    if (contacts.length === 0) return;

    const phoneContacts = contacts.filter((c) => c.phone_number);
    const lidContacts = contacts.filter((c) => c.lid && !c.phone_number);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      if (phoneContacts.length > 0) {
        // Construct bulk insert query for phone contacts
        const values: any[] = [];
        const placeholders: string[] = [];
        let paramIndex = 1;

        for (const contact of phoneContacts) {
          if (!contact.business_id) throw new Error("Business ID required for saveBatch");
          placeholders.push(
            `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
          );
          values.push(
            contact.business_id,
            contact.phone_number,
            contact.lid || null,
            contact.username || null,
            contact.pushname || null,
            contact.contact_name || null,
            contact.is_user || false
          );
          paramIndex += 7;
        }

        const query = `
          INSERT INTO contacts (business_id, phone_number, lid, username, pushname, contact_name, is_user)
          VALUES ${placeholders.join(', ')}
          ON CONFLICT (phone_number) DO UPDATE SET
            lid = COALESCE(EXCLUDED.lid, contacts.lid),
            username = COALESCE(EXCLUDED.username, contacts.username),
            pushname = COALESCE(EXCLUDED.pushname, contacts.pushname),
            contact_name = COALESCE(EXCLUDED.contact_name, contacts.contact_name),
            is_user = EXCLUDED.is_user,
            updated_at = NOW()
        `;

        await client.query(query, values);
      }

      if (lidContacts.length > 0) {
        // Construct bulk insert query for lid contacts
        const values: any[] = [];
        const placeholders: string[] = [];
        let paramIndex = 1;

        for (const contact of lidContacts) {
          if (!contact.business_id) throw new Error("Business ID required for saveBatch");
          placeholders.push(
            `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
          );
          values.push(
            contact.business_id,
            null, // phone_number is null for lid-only contacts
            contact.lid,
            contact.username || null,
            contact.pushname || null,
            contact.contact_name || null,
            contact.is_user || false
          );
          paramIndex += 7;
        }

        const query = `
          INSERT INTO contacts (business_id, phone_number, lid, username, pushname, contact_name, is_user)
          VALUES ${placeholders.join(', ')}
          ON CONFLICT (lid) DO UPDATE SET
            username = COALESCE(EXCLUDED.username, contacts.username),
            pushname = COALESCE(EXCLUDED.pushname, contacts.pushname),
            contact_name = COALESCE(EXCLUDED.contact_name, contacts.contact_name),
            is_user = EXCLUDED.is_user,
            updated_at = NOW()
        `;

        await client.query(query, values);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async list(businessId: number, offset: number, limit: number): Promise<IContact[]> {
    const result = await this.pool.query('SELECT * FROM contacts WHERE business_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [
      businessId,
      limit,
      offset,
    ]);
    return result.rows.map(
      (row) =>
        new Contact(
          row.id,
          row.business_id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.is_hidden || false,
          row.created_at,
          row.updated_at
        )
    );
  }

  public async search(businessId: number, query: string, limit: number): Promise<IContact[]> {
    const result = await this.pool.query(
      "SELECT * FROM contacts WHERE business_id = $1 AND (phone_number ILIKE $2 OR lid ILIKE $2) ORDER BY created_at DESC LIMIT $3",
      [businessId, `%${query}%`, limit]
    );
    return result.rows.map(
      (row) =>
        new Contact(
          row.id,
          row.business_id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.is_hidden || false,
          row.created_at,
          row.updated_at
        )
    );
  }

  public async findMergeCandidates(businessId: number, offset: number, limit: number): Promise<{ contacts: IContact[]; total: number }> {
    const countResult = await this.pool.query(
      'SELECT COUNT(*) FROM contacts WHERE business_id = $1 AND (phone_number IS NULL OR lid IS NULL)',
      [businessId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await this.pool.query(
      'SELECT * FROM contacts WHERE business_id = $1 AND (phone_number IS NULL OR lid IS NULL) ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [businessId, limit, offset]
    );

    const contacts = result.rows.map(
      (row) =>
        new Contact(
          row.id,
          row.business_id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.is_hidden || false,
          row.created_at,
          row.updated_at
        )
    );

    return { contacts, total };
  }

  /**
   * Retrieves an existing contact by LID or phone number, or creates a new one if not found.
   * @param contactId The LID or phone number of the contact.
   * @returns A promise that resolves to the found or newly created contact.
   */
  public async getOrCreateContact(businessId: number, contactId: string): Promise<IContact> {
    let contact: IContact | null = null;

    // Check if contactId is a LID (ends with "@lid" or doesn't start with "521")
    const isLid = contactId.endsWith('@lid') || !contactId.startsWith('521');

    if (isLid) {
      contact = await this.findByLid(businessId, contactId);
    }

    // If not found by LID or if it's a phone number, try finding by phone number
    if (!contact && !isLid) {
      contact = await this.findByPhoneNumber(businessId, contactId);
    }

    if (contact) {
      return contact;
    } else {
      // Create a new contact if not found
      const newContactData: Partial<IContact> = { business_id: businessId };
      if (isLid) {
        newContactData.lid = contactId;
      } else {
        newContactData.phone_number = contactId;
      }
      newContactData.is_user = false; // Set is_user to false for new contacts
      // You might want to add more default values or logic here for new contacts
      return this.save(newContactData);
    }
  }

  public async setMe(businessId: number, userId: number): Promise<IContact> {
    const contactToSet = await this.findById(businessId, userId);
    if (!contactToSet) {
      throw new Error(`Contact with ID ${userId} not found.`);
    }

    const businessIdFromContact = contactToSet.business_id; // Keeping it if used elsewhere but businessId is already in scope

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Set all contacts to is_user = FALSE for this business
      await client.query('UPDATE contacts SET is_user = FALSE WHERE business_id = $1 AND is_user = TRUE', [businessId]);

      // Set the specified contact to is_user = TRUE and return it
      const result = await client.query('UPDATE contacts SET is_user = TRUE WHERE id = $1 RETURNING *', [userId]);

      if (result.rows.length === 0) {
        throw new Error(`Contact with ID ${userId} not found.`);
      }

      const row = result.rows[0];
      const userContact = new Contact(
        row.id,
        row.business_id,
        row.phone_number,
        row.lid,
        row.username,
        row.pushname,
        row.contact_name,
        row.is_user,
        row.is_hidden || false,
        row.created_at,
        row.updated_at
      );

      await client.query('COMMIT');
      return userContact;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async mergeContacts(businessId: number, primaryContactId: number, secondaryContactIds: number[]): Promise<void> {
    if (!primaryContactId || secondaryContactIds.length === 0) {
      throw new Error('Primary contact ID and at least one secondary contact ID are required for merging.');
    }
    if (secondaryContactIds.includes(primaryContactId)) {
      throw new Error('Primary contact ID cannot be present in secondary contact IDs.');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const primaryContact = await this.findById(businessId, primaryContactId);
      if (!primaryContact) {
        throw new Error(`Primary contact with ID ${primaryContactId} not found.`);
      }

      const secondaryContacts: IContact[] = [];
      for (const id of secondaryContactIds) {
        const contact = await this.findById(businessId, id);
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

      // 3. Delete secondary contacts
      await client.query(
        'DELETE FROM contacts WHERE id = ANY($1::bigint[])',
        [`{${secondaryContactIds.join(',')}}`]
      );

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
      `SELECT c.*
       FROM contacts c
       JOIN messages m ON c.id = m.sender_id
       WHERE c.business_id = $1
       GROUP BY c.id
       ORDER BY MAX(m.created_at) DESC
       LIMIT $2`,
      [businessId, limit]
    );

    return result.rows.map(
      (row) =>
        new Contact(
          row.id,
          row.business_id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.is_hidden || false,
          row.created_at,
          row.updated_at
        )
    );
  }

  public async getContactsWithLastMessage(businessId: number, offset: number, limit: number): Promise<IContactWithLastMessage[]> {
    const result = await this.pool.query(
      `SELECT
        c.id AS contact_id,
        c.business_id,
        c.phone_number,
        c.lid,
        c.username,
        c.pushname,
        c.contact_name,
        c.is_user,
        c.is_hidden,
        c.created_at AS contact_created_at,
        c.updated_at AS contact_updated_at,
        m.id AS message_id,
        m.chat_id,
        m.sender_id,
        m.text_content,
        m.replied_to_message_id,
        m.quoted_message_text,
        m.created_at AS message_created_at
       FROM contacts c
       JOIN (
           SELECT
               id, chat_id, sender_id, text_content, replied_to_message_id, quoted_message_text, created_at,
               ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY created_at DESC) as rn
           FROM messages
       ) m ON c.id = m.chat_id
       WHERE m.rn = 1
       AND c.business_id = $1
       AND c.is_hidden = FALSE
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [businessId, limit, offset]
    );

    return result.rows.map(
      (row) => {
        const contact: IContact = new Contact(
          row.contact_id,
          row.business_id,
          row.phone_number,
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
          row.replied_to_message_id,
          row.quoted_message_text,
          row.message_created_at
        );

        return {
          ...contact,
          last_message: lastMessage,
        };
      }
    );
  }

  public async hideContact(businessId: number, contactIdToHide: number): Promise<void> {
    const contactToHide = await this.findById(businessId, contactIdToHide);
    if (!contactToHide) throw new Error("Contact not found");
    await this.pool.query(
      'UPDATE contacts SET is_hidden = TRUE WHERE id = $1',
      [contactIdToHide]
    );
  }

  public async getHiddenContacts(businessId: number, offset: number, limit: number): Promise<IContact[]> {
    const result = await this.pool.query(
      `SELECT * FROM contacts WHERE business_id = $1 AND is_hidden = TRUE LIMIT $2 OFFSET $3`,
      [businessId, limit, offset]
    );

    return result.rows.map(
      (row) =>
        new Contact(
          row.id,
          row.business_id,
          row.phone_number,
          row.lid,
          row.username,
          row.pushname,
          row.contact_name,
          row.is_user,
          row.is_hidden || false,
          row.created_at,
          row.updated_at
        )
    );
  }

  public async isContactHidden(businessId: number, contactId: number): Promise<boolean> {
    const contact = await this.findById(businessId, contactId);
    if (!contact) return false;
    return contact.is_hidden;
  }

  public async unhideContact(businessId: number, contactIdToUnhide: number): Promise<void> {
    const contactToUnhide = await this.findById(businessId, contactIdToUnhide);
    if (!contactToUnhide) return;
    await this.pool.query(
      'UPDATE contacts SET is_hidden = FALSE WHERE id = $1',
      [contactIdToUnhide]
    );
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