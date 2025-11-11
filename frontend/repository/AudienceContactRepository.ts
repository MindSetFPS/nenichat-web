import { IContact } from './IContact';
import { IAudienceContactRepository } from './IAudienceContactRepository';
import { Contact } from './Contact';
import { sql } from './db';

export class AudienceContactRepository implements IAudienceContactRepository {
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

  async findByAudienceId(audienceId: string): Promise<IContact[]> {
    const result: any[] = await this.sql`
      SELECT c.*
      FROM contacts c
      JOIN audience_contacts ac ON c.id = ac.contact_id
      WHERE ac.audience_id = ${audienceId}
    `;
    return result.map(this.toContact);
  }

  async addContactToAudience(audienceId: string, contactId: string): Promise<void> {
    await this.sql`
      INSERT INTO audience_contacts (audience_id, contact_id)
      VALUES (${audienceId}, ${contactId})
      ON CONFLICT (audience_id, contact_id) DO NOTHING
    `;
  }

  async removeContactFromAudience(audienceId: string, contactId: string): Promise<void> {
    await this.sql`
      DELETE FROM audience_contacts
      WHERE audience_id = ${audienceId} AND contact_id = ${contactId}
    `;
  }

  async updateAudienceMembers(audienceId: string, contactIds: string[]): Promise<void> {
    await this.sql.begin(async (sql: any) => {
      // Delete existing members for the audience
      await sql`
        DELETE FROM audience_contacts
        WHERE audience_id = ${audienceId}
      `;

      // Insert new members
      if (contactIds.length > 0) {
        const values = contactIds.map(contactId => ({
          audience_id: audienceId,
          contact_id: contactId
        }));
        await sql`
          INSERT INTO audience_contacts ${sql(values)}
          ON CONFLICT (audience_id, contact_id) DO NOTHING
        `;
      }
    });
  }
}

export const audienceContactRepository = new AudienceContactRepository(sql);
