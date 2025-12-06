import { IProduct } from './IProduct';

/**
 * @interface IProductRepository
 * @description Defines the contract for interacting with product data.
 */
export interface IProductRepository {
  /**
   * Retrieves a product by its unique identifier.
   * @param {string} id - The ID of the product to retrieve.
   * @returns {Promise<IProduct | null>} A promise that resolves to the product if found, otherwise null.
   */
  getById(id: string): Promise<IProduct | null>;

  /**
   * Retrieves all products.
   * @returns {Promise<IProduct[]>} A promise that resolves to an array of products.
   */
  getAll(): Promise<IProduct[]>;

  /**
   * Retrieves a list of products with pagination.
   * @param {number} limit - The maximum number of products to return.
   * @param {number} offset - The number of products to skip.
   * @returns {Promise<IProduct[]>} A promise that resolves to an array of products.
   */
  list(limit: number, offset: number): Promise<IProduct[]>;

  /**
   * Creates a new product.
   * @param {IProduct} product - The product object to create.
   * @returns {Promise<IProduct>} A promise that resolves to the created product.
   */
  create(product: IProduct): Promise<IProduct>;

  /**
   * Updates an existing product.
   * @param {string} id - The ID of the product to update.
   * @param {Partial<IProduct>} updates - An object containing the fields to update.
   * @returns {Promise<IProduct | null>} A promise that resolves to the updated product if found, otherwise null.
   */
  update(id: string, updates: Partial<IProduct>): Promise<IProduct | null>;

  /**
   * Deletes a product by its unique identifier.
   * @param {string} id - The ID of the product to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the product was deleted, otherwise false.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Deletes a specific image from a product.
   * @param {string} productId - The ID of the product.
   * @param {string} imageId - The ID of the image to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if the image was deleted, otherwise false.
   */
  deleteImage(productId: string, imageId: string): Promise<boolean>;
}
