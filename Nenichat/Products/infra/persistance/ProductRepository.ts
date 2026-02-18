import { Pool } from 'pg';
import { IProduct, IProductWithUnitsSold } from '../../domain/IProduct';
import { IProductRepository } from '../../domain/IProductRepository';
import { Product } from '../../domain/Product';
import { pool } from '../../../Shared/infra/persistance/db';
import fs from 'fs/promises';
import path from 'path';

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
   * @param {number} businessId - The ID of the business.
   * @param {string} id - The ID of the product to retrieve.
   * @returns {Promise<IProduct | null>} A promise that resolves to the product if found, otherwise null.
   */
  async getById(businessId: number, id: string): Promise<IProduct | null> {
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
      WHERE p.id = $1 AND p.business_id = $2
      GROUP BY p.id;
    `;
    const result = await this.pool.query(query, [id, businessId]);
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Product(
      row.id,
      row.name,
      row.description,
      parseFloat(row.price),
      row.stock,
      row.images,
      row.whatsapp_product_id,
      row.is_active,
      row.created_at,
      row.updated_at
    );
  }

  /**
   * Retrieves all products, including their images and units sold in the last month.
   * @param {number} businessId - The ID of the business.
   * @returns {Promise<IProduct[]>} A promise that resolves to an array of products.
   */
  async getAll(businessId: number): Promise<IProductWithUnitsSold[]> {
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
      WHERE p.business_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC;
    `;
    const result = await this.pool.query(query, [businessId]);
    const products = result.rows.map(
      (row) =>
        new Product(
          row.id,
          row.name,
          row.description,
          parseFloat(row.price),
          row.stock,
          row.images,
          row.whatsapp_product_id,
          row.is_active,
          row.created_at,
          row.updated_at
        )
    );

    // Fetch monthly sales for each product
    const salesQuery = `
      SELECT
        COUNT(*) as units_sold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = $1 AND o.business_id = $2
      AND o.created_at >= CURRENT_DATE - INTERVAL '1 month'
    `;

    for (const product of products) {
      const salesResult = await this.pool.query(salesQuery, [product.id, businessId]);
      (product as any).units_sold = salesResult.rows[0].units_sold;
    }

    const productWithUnitsSold = products as IProductWithUnitsSold[];
    return productWithUnitsSold;
  }

  /**
   * Retrieves a list of products with pagination.
   * @param {number} businessId - The ID of the business.
   * @param {number} limit - The maximum number of products to return.
   * @param {number} offset - The number of products to skip.
   * @param {boolean} active_only - Whether to only return active products or all products.
   * @returns {Promise<IProduct[]>} A promise that resolves to an array of products.
   */
  async list(businessId: number, limit: number, offset: number, active_only?: boolean): Promise<IProductWithUnitsSold[]> {
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
      WHERE p.business_id = $3
      ${active_only ? 'AND p.is_active = true' : ''}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const result = await this.pool.query(query, [limit, offset, businessId]);
    return result.rows.map(
      (row) => {
        const product = new Product(
          row.id,
          row.name,
          row.description,
          parseFloat(row.price),
          row.stock,
          row.images,
          row.whatsapp_product_id,
          row.is_active,
          row.created_at,
          row.updated_at
        );
        return {
          ...product,
          units_sold: 0 // Default to 0 for list in this repo
        } as IProductWithUnitsSold;
      }
    );
  }

  /**
   * Creates a new product.
   * @param {number} businessId - The ID of the business.
   * @param {Omit<IProduct, 'business_id' | 'created_at' | 'updated_at'>} product - The product data.
   * @returns {Promise<IProduct>} A promise that resolves to the created product.
   */
  async create(businessId: number, product: Omit<IProduct, 'business_id' | 'created_at' | 'updated_at'>): Promise<IProduct> {
    const result = await this.pool.query(
      'INSERT INTO products (id, name, description, price, stock, whatsapp_product_id, is_active, business_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        product.id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.whatsapp_product_id,
        product.is_active,
        businessId
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
      row.is_active,
      row.created_at,
      row.updated_at
    );
  }

  /**
   * Updates an existing product.
   * @param {number} businessId - The ID of the business.
   * @param {string} id - The ID of the product to update.
   * @param {Partial<IProduct>} updates - An object containing the fields to update.
   * @returns {Promise<IProduct | null>} A promise that resolves to the updated product if found, otherwise null.
   */
  async update(businessId: number, id: string, updates: Partial<IProduct>): Promise<IProduct | null> {
    const { images, ...productUpdates } = updates; // Exclude images from direct update

    const fields = Object.keys(productUpdates)
      .filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'business_id')
      .map((key, index) => `"${key}" = $${index + 3}`)
      .join(', ');
    const values = Object.values(productUpdates).filter((_, index) => {
      const key = Object.keys(productUpdates)[index];
      return key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'business_id';
    });

    if (fields.length === 0) {
      return this.getById(businessId, id); // No updates to apply
    }

    const result = await this.pool.query(
      `UPDATE products SET ${fields}, updated_at = NOW() WHERE id = $1 AND business_id = $2 RETURNING *`,
      [id, businessId, ...values]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // The updated product is fetched again to get the images
    return this.getById(businessId, id);
  }

  /**
   * Deletes a product by its unique identifier.
   * @param {number} businessId - The ID of the business.
   * @param {string} id - The ID of the product to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the product was deleted, otherwise false.
   */
  async delete(businessId: number, id: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get all images associated with the product to potentially clean them up later
      const productImagesResult = await client.query(
        `SELECT i.id, i.path 
         FROM images i
         JOIN product_images pi ON i.id = pi.image_id
         JOIN products p ON pi.product_id = p.id
         WHERE pi.product_id = $1 AND p.business_id = $2`,
        [id, businessId]
      );
      const imagesToCheck = productImagesResult.rows;

      // 2. Delete the product
      const deleteProductResult = await client.query('DELETE FROM products WHERE id = $1 AND business_id = $2', [id, businessId]);

      if ((deleteProductResult.rowCount || 0) === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      // 3. Check and cleanup orphaned images
      for (const img of imagesToCheck) {
        const checkReferencesResult = await client.query(
          'SELECT COUNT(*) FROM product_images WHERE image_id = $1',
          [img.id]
        );
        const isImageReferenced = parseInt(checkReferencesResult.rows[0].count, 10) > 0;

        if (!isImageReferenced) {
          await client.query('DELETE FROM images WHERE id = $1', [img.id]);

          const absolutePath = path.join(process.cwd(), 'public', img.path);
          try {
            await fs.unlink(absolutePath);
          } catch (fsError: any) {
            if (fsError.code === 'ENOENT') {
              console.warn(`File not found on disk, skipping deletion: ${absolutePath}`);
            } else {
              console.error(`Failed to delete file ${absolutePath}:`, fsError);
            }
          }
        }
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting product:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Deletes a specific image from a product.
   * @param {number} businessId - The ID of the business.
   * @param {string} productId - The ID of the product.
   * @param {string} imageId - The ID of the image to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the image was deleted/dissociated, otherwise false.
   */
  async deleteImage(businessId: number, productId: string, imageId: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Verify product belongs to business
      const productCheck = await client.query('SELECT id FROM products WHERE id = $1 AND business_id = $2', [productId, businessId]);
      if (productCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      // 1. Get image path from the images table
      const imageResult = await client.query('SELECT path FROM images WHERE id = $1', [imageId]);
      if (imageResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false; // Image not found
      }
      const imagePath = imageResult.rows[0].path;

      // 2. Delete the association from product_images
      const deleteAssociationResult = await client.query(
        'DELETE FROM product_images WHERE product_id = $1 AND image_id = $2',
        [productId, imageId]
      );

      if (deleteAssociationResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return false; // Association not found
      }

      // 3. Check if the image is referenced by any other product
      const checkReferencesResult = await client.query(
        'SELECT COUNT(*) FROM product_images WHERE image_id = $1',
        [imageId]
      );
      const isImageReferenced = parseInt(checkReferencesResult.rows[0].count, 10) > 0;

      // 4. If not referenced by any other product, delete from images table and filesystem
      if (!isImageReferenced) {
        await client.query('DELETE FROM images WHERE id = $1', [imageId]);

        const absolutePath = path.join(process.cwd(), 'public', imagePath);
        try {
          await fs.unlink(absolutePath);
        } catch (fsError: any) {
          if (fsError.code === 'ENOENT') {
            console.warn(`File not found on disk, skipping deletion: ${absolutePath}`);
          } else {
            console.error(`Failed to delete file ${absolutePath}:`, fsError);
          }
        }
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting image:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const productRepository = new ProductRepository(pool)