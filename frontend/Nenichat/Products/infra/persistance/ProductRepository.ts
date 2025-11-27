import { Pool } from 'pg';
import { IProduct } from '../../domain/IProduct';
import { IProductRepository } from '../../domain/IProductRepository';
import { Product } from '../../domain/Product';
import { pool } from '../../../Shared/infra/persistance/db';
import { IImage } from '../../../../dto/IImage';
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
   * This method handles the deletion of the product and cleans up any orphaned images
   * from the database and filesystem.
   * @param {string} id - The ID of the product to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the product was deleted, otherwise false.
   */
  async delete(id: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get all images associated with the product to potentially clean them up later
      const productImagesResult = await client.query(
        `SELECT i.id, i.path 
         FROM images i
         JOIN product_images pi ON i.id = pi.image_id
         WHERE pi.product_id = $1`,
        [id]
      );
      const imagesToCheck = productImagesResult.rows;

      // 2. Delete the product
      // This will cascade delete from product_images due to ON DELETE CASCADE foreign key
      const deleteProductResult = await client.query('DELETE FROM products WHERE id = $1', [id]);

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
   * This method removes the association between the product and the image.
   * If the image is not associated with any other products, it is deleted from the database and filesystem.
   * @param {string} productId - The ID of the product.
   * @param {string} imageId - The ID of the image to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the image was deleted/dissociated, otherwise false.
   */
  async deleteImage(productId: string, imageId: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

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
            // We don't rollback here because the DB state is consistent (image deleted)
            // but we log the error.
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

