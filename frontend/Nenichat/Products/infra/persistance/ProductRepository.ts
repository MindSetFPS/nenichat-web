import { Pool } from 'pg';
import { IProduct } from '../../domain/IProduct';
import { IProductRepository } from '../../domain/IProductRepository';
import { Product } from '../../domain/Product';
import { pool } from '../../../../repository/db';
import { IImage } from '../../../../dto/IImage';

/**
 * @class ProductRepository
 * @description Implements the IProductRepository interface for managing product data.
 *              This implementation interacts with a PostgreSQL database.
 */
export class ProductRepository implements IProductRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Retrieves a product by its unique identifier, including its images.
   * @param {string} id - The ID of the product to retrieve.
   * @returns {Promise<IProduct | null>} A promise that resolves to the product if found, otherwise null.
   */
  async getById(id: string): Promise<IProduct | null> {
    const query = `
      SELECT
        p.*,
        COALESCE(
          (
            SELECT json_agg(i.* ORDER BY pi.display_order)
            FROM product_images pi
            JOIN images i ON pi.image_id = i.id
            WHERE pi.product_id = p.id
          ),
          '[]'
        ) as images
      FROM products p
      WHERE p.id = $1
      GROUP BY p.id;
    `;
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    console.log(row)
    return new Product(
      row.id,
      row.name,
      row.description,
      parseFloat(row.price),
      row.stock,
      row.images,
      row.whatsapp_product_id,
      row.created_at,
      row.updated_at
    );
  }

  /**
   * Retrieves all products, including their images.
   * @returns {Promise<IProduct[]>} A promise that resolves to an array of products.
   */
  async getAll(): Promise<IProduct[]> {
    const query = `
      SELECT
        p.*,
        COALESCE(
          (
            SELECT json_agg(i.* ORDER BY pi.display_order)
            FROM product_images pi
            JOIN images i ON pi.image_id = i.id
            WHERE pi.product_id = p.id
          ),
          '[]'
        ) as images
      FROM products p
      GROUP BY p.id
      ORDER BY p.created_at DESC;
    `;
    const result = await this.pool.query(query);
    return result.rows.map(
      (row) =>
        new Product(
          row.id,
          row.name,
          row.description,
          parseFloat(row.price),
          row.stock,
          row.images,
          row.whatsapp_product_id,
          row.created_at,
          row.updated_at
        )
    );
  }

  /**
   * Creates a new product. Note: This method does not handle image creation.
   * Image creation and association should be handled in a service layer or API route
   * to ensure transactional integrity.
   * @param {IProduct} product - The product object to create.
   * @returns {Promise<IProduct>} A promise that resolves to the created product.
   */
  async create(product: IProduct): Promise<IProduct> {
    const result = await this.pool.query(
      'INSERT INTO products (id, name, description, price, stock, whatsapp_product_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        product.id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.whatsapp_product_id,
      ]
    );
    const row = result.rows[0];
    return new Product(
      row.id,
      row.name,
      row.description,
      parseFloat(row.price),
      row.stock,
      [], // Images are not handled here
      row.whatsapp_product_id,
      row.created_at,
      row.updated_at
    );
  }

  /**
   * Updates an existing product. Note: This method does not handle image updates.
   * Image updates and associations should be handled in a service layer or API route
   * to ensure transactional integrity.
   * @param {string} id - The ID of the product to update.
   * @param {Partial<IProduct>} updates - An object containing the fields to update.
   * @returns {Promise<IProduct | null>} A promise that resolves to the updated product if found, otherwise null.
   */
  async update(id: string, updates: Partial<IProduct>): Promise<IProduct | null> {
    const { images, ...productUpdates } = updates; // Exclude images from direct update

    const fields = Object.keys(productUpdates)
      .map((key, index) => `"${key}" = $${index + 2}`)
      .join(', ');
    const values = Object.values(productUpdates);

    if (fields.length === 0) {
      return this.getById(id); // No updates to apply
    }

    const result = await this.pool.query(
      `UPDATE products SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // The updated product is fetched again to get the images
    return this.getById(id);
  }

  /**
   * Deletes a product by its unique identifier.
   * The database is set up with ON DELETE CASCADE, so product_images will be deleted automatically.
   * Note: This does not delete images from the filesystem or the images table itself if they are no longer referenced.
   * A separate cleanup process would be needed for that.
   * @param {string} id - The ID of the product to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the product was deleted, otherwise false.
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }
}

