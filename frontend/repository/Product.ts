import { IProduct } from '../dto/IProduct';
import { IImage } from '../dto/IImage';

export class Product implements IProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: IImage[];
  whatsapp_product_id: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(
    id: string,
    name: string,
    description: string | null,
    price: number,
    stock: number,
    images: IImage[],
    whatsapp_product_id: string | null,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.images = images;
    this.whatsapp_product_id = whatsapp_product_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}