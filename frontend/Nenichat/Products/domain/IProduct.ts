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
  created_at: Date;
  updated_at: Date;
}
