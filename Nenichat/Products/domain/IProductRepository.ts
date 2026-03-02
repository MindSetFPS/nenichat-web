import { IProduct, IProductWithUnitsSold } from './IProduct';

/**
 * @interface IProductRepository
 * @description Defines the contract for interacting with product data.
 */
export interface IProductRepository {
  /**
   * Retrieves a product by its unique identifier.
   */
  getById(businessId: number, id: string): Promise<IProduct | null>;

  /**
   * Retrieves all products.
   */
  getAll(businessId: number): Promise<IProductWithUnitsSold[]>;

  /**
   * Retrieves a list of products with pagination.
   */
  list(businessId: number, limit: number, offset: number, active_only?: boolean): Promise<IProductWithUnitsSold[]>;

  /**
   * Creates a new product.
   */
  create(businessId: number, product: Omit<IProduct, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<IProduct>;

  /**
   * Updates an existing product.
   */
  update(businessId: number, id: string, updates: Partial<IProduct>): Promise<IProduct | null>;

  /**
   * Deletes a product by its unique identifier.
   */
  delete(businessId: number, id: string): Promise<boolean>;

  /**
   * Deletes a specific image from a product.
   */
  deleteImage(businessId: number, productId: string, imageId: string): Promise<boolean>;

  /**
   * Retrieves sales data for a product.
   */
  getProductSales(businessId: number, productId: string): Promise<{ quantity: number, created_at: Date }[]>;
}
