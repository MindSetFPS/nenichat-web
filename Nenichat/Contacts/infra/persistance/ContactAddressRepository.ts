import { Pool } from 'pg';
import { IContactAddress } from '../../domain/IContactAddress';
import { IContactAddressRepository } from '../../domain/IContactAddressRepository';
import { ContactAddress } from '../../domain/ContactAddress';

export class ContactAddressRepository implements IContactAddressRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private mapRowToContactAddress(row: any): ContactAddress {
        return new ContactAddress(
            parseInt(row.id),
            parseInt(row.contact_id),
            row.address,
            row.label,
            row.is_default,
            row.created_at,
            row.updated_at
        );
    }

    async getById(id: number): Promise<IContactAddress | null> {
        const result = await this.pool.query('SELECT * FROM contact_addresses WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToContactAddress(result.rows[0]);
    }

    async getByContactId(contactId: number): Promise<IContactAddress[]> {
        const result = await this.pool.query('SELECT * FROM contact_addresses WHERE contact_id = $1 ORDER BY is_default DESC, created_at DESC', [contactId]);
        return result.rows.map(this.mapRowToContactAddress);
    }

    async create(address: Omit<IContactAddress, 'id' | 'created_at' | 'updated_at'>): Promise<IContactAddress> {
        const query = `
      INSERT INTO contact_addresses (contact_id, address, label, is_default)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const values = [
            address.contact_id,
            address.address,
            address.label,
            address.is_default
        ];
        const result = await this.pool.query(query, values);
        return this.mapRowToContactAddress(result.rows[0]);
    }

    async update(id: number, updates: Partial<IContactAddress>): Promise<IContactAddress | null> {
        const fields = Object.keys(updates)
            .map((key, index) => `"${key}" = $${index + 2}`)
            .join(', ');
        const values = Object.values(updates);

        if (fields.length === 0) {
            return this.getById(id);
        }

        const query = `UPDATE contact_addresses SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`;
        const result = await this.pool.query(query, [id, ...values]);

        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToContactAddress(result.rows[0]);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.pool.query('DELETE FROM contact_addresses WHERE id = $1', [id]);
        return (result.rowCount || 0) > 0;
    }

    async setDefault(id: number, contactId: number): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Unset default for all other addresses of this contact
            await client.query('UPDATE contact_addresses SET is_default = FALSE WHERE contact_id = $1', [contactId]);
            // Set default for the specified address
            const result = await client.query('UPDATE contact_addresses SET is_default = TRUE WHERE id = $1 AND contact_id = $2', [id, contactId]);
            await client.query('COMMIT');
            return (result.rowCount || 0) > 0;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}
