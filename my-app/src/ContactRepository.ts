import { SQL } from 'bun';
import { IContact } from './IContact';
import { IContactRepository } from './IContactRepository';
import { Contact } from './Contact';

export class ContactRepository implements IContactRepository {
  private sql: SQL;

  constructor() {
    // This connection string uses the details from your docker-compose.yml.
    // It assumes you are running this application on your host machine.
    // this.sql = new SQL("postgres://user:password@localhost:5432/mydb");
    try {
      const user = process.env.DB_USER;
      const password = process.env.DB_PASSWORD;
      const host = process.env.DB_HOST;
      const port = process.env.DB_PORT;
      const db = process.env.DB_NAME;

      if (!user) throw new Error("Missing environment variable: POSTGRES_USER");
      if (!password) throw new Error("Missing environment variable: POSTGRES_PASSWORD");
      if (!host) throw new Error("Missing environment variable: POSTGRES_HOST");
      if (!port) throw new Error("Missing environment variable: POSTGRES_PORT");
      if (!db) throw new Error("Missing environment variable: POSTGRES_DB");

      const connectionString = `postgres://${user}:${password}@${host}:${port}/${db}`;
      this.sql = new SQL(connectionString);
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<IContact | null> {
    const contacts: any[] = await this.sql`SELECT * FROM contacts WHERE phone_number = ${phoneNumber}`;

    if (contacts.length === 0) {
      return null;
    }
    const d = contacts[0];
    // The database returns a plain object; we instantiate the Contact class
    // to ensure it has all the methods defined in the IContact interface.
    return new Contact(d.id, d.phone_number, d.pushname, d.created_at, d.updated_at);
  }

  async findById(id: bigint): Promise<IContact | null> {
    const contacts: any[] = await this.sql`SELECT * FROM contacts WHERE id = ${id}`;

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

    const result: any[] = await this.sql`
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
}
