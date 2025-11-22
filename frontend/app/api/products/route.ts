import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '../../../Nenichat/Products/infra/persistance/ProductRepository';
import { pool } from '../../../Nenichat/Shared/infra/persistance/db';
import { IProduct } from '../../../Nenichat/Products/domain/IProduct';
import { IImage } from '../../../dto/IImage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const productRepository = new ProductRepository(pool);

// Define the upload directory
const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');

/**
 * @function POST
 * @description Handles POST requests to create a new product with images.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {NextResponse} The response containing the created product or an error.
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const formData = await request.formData();

    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString() || null;
    const price = parseFloat(formData.get('price')?.toString() || '0');
    const stock = parseInt(formData.get('stock')?.toString() || '0', 10);
    const whatsapp_product_id = formData.get('whatsapp_product_id')?.toString() || null;

    if (!name || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ error: 'Missing or invalid product data' }, { status: 400 });
    }

    const newProductId = uuidv4();
    const images: IImage[] = [];
    const imageFiles = formData.getAll('images') as File[]; // 'images' is the name of the file input

    for (const file of imageFiles) {
      if (file instanceof File) {
        const fileExtension = path.extname(file.name);
        const uniqueFileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        const relativePath = `/images/products/${uniqueFileName}`;

        // Save the file to the public directory
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        const newImage: IImage = {
          id: uuidv4(),
          path: relativePath,
          alt_text: file.name, // Use original filename as alt text for now
          created_at: new Date(),
        };
        images.push(newImage);
      }
    }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Create the product
      const newProduct: IProduct = {
        id: newProductId,
        name,
        description,
        price,
        stock,
        images: [], // Images are handled separately
        whatsapp_product_id,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const createdProduct = await productRepository.create(newProduct);

      // 2. Insert images into the images table and product_images table
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await client.query(
          'INSERT INTO images (id, path, alt_text, created_at) VALUES ($1, $2, $3, $4)',
          [image.id, image.path, image.alt_text, image.created_at]
        );
        await client.query(
          'INSERT INTO product_images (product_id, image_id, display_order) VALUES ($1, $2, $3)',
          [createdProduct.id, image.id, i]
        );
      }

      await client.query('COMMIT');

      // Fetch the product again to include the newly associated images
      const productWithImages = await productRepository.getById(createdProduct.id);

      return NextResponse.json(productWithImages, { status: 201 });
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('Database transaction failed:', dbError);
      return NextResponse.json({ error: 'Failed to create product with images' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
