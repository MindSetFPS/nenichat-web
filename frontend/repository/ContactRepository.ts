import { IContact } from './IContact';
import { IContactRepository } from './IContactRepository';
import { Contact } from './Contact';
import { sql } from './db';

export class ContactRepository implements IContactRepository {
  constructor(private sql: any) {}

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

  async findById(id: bigint): Promise<IContact | null> {
    const result: any[] = await this.sql`SELECT * FROM contacts WHERE id = ${id}`;

    if (result.length === 0) {
      return null;
    }
    return this.toContact(result[0]);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<IContact | null> {
    const result: any[] =
      await this.sql`SELECT * FROM contacts WHERE phone_number = ${phoneNumber}`;

    if (result.length === 0) {
      return null;
    }
    return this.toContact(result[0]);
  }

  async findByLid(lid: string): Promise<IContact | null> {
    const result: any[] =
      await this.sql`SELECT * FROM contacts WHERE lid = ${lid}`;

    if (result.length === 0) {
      return null;
    }
    return this.toContact(result[0]);
  }

  async save(contact: Partial<IContact>): Promise<IContact> {
    const { phone_number, lid, username, pushname, contact_name, is_user } =
      contact;

    if (!phone_number && !lid) {
      throw new Error(
        'Either phone_number or lid must be provided to save a contact.'
      );
    }

    let existingContact: IContact | null = null;
    if (phone_number) {
      existingContact = await this.findByPhoneNumber(phone_number);
    }
    if (!existingContact && lid) {
      existingContact = await this.findByLid(lid);
    }

    if (existingContact) {
      // Update existing contact
      const contactToUpdate = { ...existingContact, ...contact };
      const result: any[] = await this.sql`
        UPDATE contacts
        SET
          phone_number = ${contactToUpdate.phone_number},
          lid = ${contactToUpdate.lid},
          username = ${contactToUpdate.username},
          pushname = ${contactToUpdate.pushname},
          contact_name = ${contactToUpdate.contact_name},
          is_user = ${contactToUpdate.is_user},
          updated_at = NOW()
        WHERE id = ${existingContact.id}
        RETURNING *
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to save contact.');
      }
      return this.toContact(result[0]);
    } else {
      // Insert new contact
      const result: any[] = await this.sql`
        INSERT INTO contacts (phone_number, lid, username, pushname, contact_name, is_user)
        VALUES (${phone_number || null}, ${lid || null}, ${username || null}, ${
        pushname || null
      }, ${contact_name || null}, ${is_user || false})
        RETURNING *
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to save contact.');
      }
      return this.toContact(result[0]);
    }
  }


  async findUser(): Promise<IContact | null> {
    const result: any[] =
      await this.sql`SELECT * FROM contacts WHERE is_user = true LIMIT 1`;

    if (result.length === 0) {
      return null;
    }
    return this.toContact(result[0]);
  }

  async list(offset: number, limit: number): Promise<IContact[]> {
    const contacts: any[] =
      await this.sql`SELECT * FROM contacts WHERE is_user = false ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`;

    return contacts.map((d) => this.toContact(d));
  }
}

export const contactRepository = new ContactRepository(sql);