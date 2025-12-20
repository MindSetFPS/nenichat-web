import { IImage } from '../../../dto/IImage';

/**
 * @interface IProduct
 * @description Defines the structure for a product.
 */
export interface IProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: IImage[];
  whatsapp_product_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * @interface IProductWithUnitsSold
 * @description Extends IProduct with units sold information for analytics.
 */
export interface IProductWithUnitsSold extends IProduct {
  units_sold: number;
}
