import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/Nenichat/Products/infra/persistance/ProductRepository';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { IProduct } from '@/Nenichat/Products/domain/IProduct';
import { IImage } from '@/dto/IImage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';

const productRepository = new ProductRepository(pool);

// Define the upload directory
const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');

/**
 * @function PUT
 * @description Handles PUT requests to update an existing product, including image management.
 * @param {NextRequest} request - The incoming Next.js request.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The ID of the product to update.
 * @returns {NextResponse} The response containing the updated product or an error.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const formData = await request.formData();

    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString() || null;
    const price = parseFloat(formData.get('price')?.toString() || '0');
    const stock = parseInt(formData.get('stock')?.toString() || '0', 10);
    const whatsapp_product_id = formData.get('whatsapp_product_id')?.toString() || null;
    const is_active_raw = formData.get('is_active');
    const existingImageIds = formData.getAll('existingImageIds') as string[]; // IDs of images that should remain

    if (!name || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ error: 'Missing or invalid product data' }, { status: 400 });
    }

    const updates: Partial<IProduct> = {
      name,
      description,
      price,
      stock,
      whatsapp_product_id,
      ...(is_active_raw !== null ? { is_active: is_active_raw === 'true' } : {}),
    };

    const newImagesToProcess: IImage[] = [];
    const newImageFiles = formData.getAll('newImages') as File[]; // 'newImages' is the name of the file input for new images

    for (const file of newImageFiles) {
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
        newImagesToProcess.push(newImage);
      }
    }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Update the product details
      const updatedProduct = await productRepository.update(business.id, id, updates);
      if (!updatedProduct) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // 2. Get current images associated with the product
      const currentProduct = await productRepository.getById(business.id, id);
      const currentImageIds = currentProduct?.images?.map(img => img.id) || [];

      // 3. Determine images to delete (those not in existingImageIds)
      const imagesToDeleteFromDb = currentImageIds.filter(imageId => !existingImageIds.includes(imageId));

      // 4. Delete images from product_images and images table, and filesystem
      for (const imageId of imagesToDeleteFromDb) {
        // Get image path before deleting from DB
        const imageResult = await client.query('SELECT path FROM images WHERE id = $1', [imageId]);
        if (imageResult.rows.length > 0) {
          const imagePath = imageResult.rows[0].path;
          // Delete from product_images (CASCADE will handle this if product is deleted, but here we delete specific image)
          await client.query('DELETE FROM product_images WHERE product_id = $1 AND image_id = $2', [id, imageId]);
          // Delete from images table
          await client.query('DELETE FROM images WHERE id = $1', [imageId]);
          // Delete from filesystem
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
      }

      // 5. Insert new images and associate them
      let displayOrder = existingImageIds.length > 0 ? existingImageIds.length : 0; // Start display order after existing ones
      for (const image of newImagesToProcess) {
        await client.query(
          'INSERT INTO images (id, path, alt_text, created_at) VALUES ($1, $2, $3, $4)',
          [image.id, image.path, image.alt_text, image.created_at]
        );
        await client.query(
          'INSERT INTO product_images (product_id, image_id, display_order) VALUES ($1, $2, $3)',
          [id, image.id, displayOrder++]
        );
      }

      await client.query('COMMIT');

      // Fetch the product again to include the newly associated images
      const productWithImages = await productRepository.getById(business.id, id);

      return NextResponse.json(productWithImages, { status: 200 });
    } catch (dbError) {
      await client.query('ROLLBACK');
      console.error('Database transaction failed:', dbError);
      return NextResponse.json({ error: 'Failed to update product with images' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

/**
 * @function DELETE
 * @description Handles DELETE requests to remove a product or a specific image from a product.
 * @param {NextRequest} request - The incoming Next.js request.
 * @param {Object} params - The route parameters.
 * @param {string} params.id - The ID of the product.
 * @returns {NextResponse} A response indicating success or failure.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;

  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  // Get imageId from query parameters or request body
  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get('imageId');

  try {
    if (imageId) {
      const success = await productRepository.deleteImage(business.id, productId, imageId);
      if (!success) {
        return NextResponse.json({ error: 'Failed to delete image (not found or not associated)' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 });
    } else {
      const success = await productRepository.delete(business.id, productId);
      if (!success) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in DELETE operation:', error);
    return NextResponse.json({ error: 'Failed to perform delete operation' }, { status: 500 });
  }
}
