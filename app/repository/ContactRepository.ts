import { IContact } from './IContact';
import { IContactRepository } from './IContactRepository';
import { Contact } from './Contact';
import { sql } from './db';

export class ContactRepository implements IContactRepository {
  
  constructor(private sql: Bun.SQL) {}

  async findByPhoneNumber(phoneNumber: string): Promise<IContact | null> {
    const contacts: IContact[] = await this.sql`SELECT * FROM contacts WHERE phone_number = ${phoneNumber}`;

    if (contacts.length === 0) {
      return null;
    }
    const d = contacts[0];
    // The database returns a plain object; we instantiate the Contact class
    // to ensure it has all the methods defined in the IContact interface.
    return new Contact(d.id, d.phone_number, d.pushname, d.created_at, d.updated_at);
  }

  async findById(id: bigint): Promise<IContact | null> {
    const contacts: IContact[] = await this.sql`SELECT * FROM contacts WHERE id = ${id}`;

    if (contacts.length === 0) {
      return null;
    }
    const d = contacts[0];
    return new Contact(d.id, d.phone_number, d.pushname, d.created_at, d.updated_at);
  }

  async saveContact(contact: IContact): Promise<IContact>;
  async saveContact(phoneNumber: string, pushname: string | null): Promise<IContact>;
  async saveContact(arg1: IContact | string, arg2?: string | null): Promise<IContact> {
    let phone_number: string;
    let pushname: string | null;

    if (typeof arg1 === 'string') {
      phone_number = arg1;
      pushname = arg2 === undefined ? null : arg2;
    } else {
      phone_number = arg1.phone_number;
      pushname = arg1.pushname;
    }

    const result: IContact[] = await this.sql`
      INSERT INTO contacts (phone_number, pushname, updated_at)
      VALUES (${phone_number}, ${pushname}, NOW())
      ON CONFLICT (phone_number)
      DO UPDATE SET
        pushname = EXCLUDED.pushname,
        updated_at = NOW()
      RETURNING *
    `;

    const d = result[0];
    return new Contact(d.id, d.phone_number, d.pushname, d.created_at, d.updated_at);
  }

  async getContacts(offset: number, limit: number): Promise<IContact[]> {
    const contacts: IContact[] = await this.sql`SELECT * FROM contacts ORDER BY id LIMIT ${limit} OFFSET ${offset}`;

    return contacts.map(d => new Contact(d.id, d.phone_number, d.pushname, d.created_at, d.updated_at));
  }
}

export const contactRepository = new ContactRepository(sql);
