import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseProductRepository } from '@/Nenichat/Products/infra/persistance/SupabaseProductRepository';
import { getBusinessFromUser } from '@/lib/user-auth';
import { IImage } from '@/dto/IImage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

// Define the upload directory
// in next versions replace local image save with supabase bucket
const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');

/**
 * @function GET
 * @description Handles GET requests to retrieve a list of products with pagination.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {NextResponse} The response containing the list of products or an error.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const productRepository = new SupabaseProductRepository(supabase);

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const active_only = searchParams.get('active_only') === 'true';

    const products = await productRepository.list(business.id, limit, offset, active_only);
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error listing products:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

/**
 * @function POST
 * @description Handles POST requests to create a new product with images.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {NextResponse} The response containing the created product or an error.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const productRepository = new SupabaseProductRepository(supabase);

  try {
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const formData = await request.formData();

    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString() || null;
    const price = parseFloat(formData.get('price')?.toString() || '0');
    const stock = parseInt(formData.get('stock')?.toString() || '0', 10);
    const whatsapp_product_id = formData.get('whatsapp_product_id')?.toString() || null;
    const is_active_raw = formData.get('is_active');
    const is_active = is_active_raw !== null ? is_active_raw === 'true' : true;

    if (!name || isNaN(price) || isNaN(stock)) {
      return NextResponse.json({ error: 'Missing or invalid product data' }, { status: 400 });
    }

    const newProductId = uuidv4();
    const images: IImage[] = [];
    const imageFiles = formData.getAll('images') as File[];

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
          alt_text: file.name,
          created_at: new Date(),
        };
        images.push(newImage);
      }
    }

    // Creating product via Supabase
    const { data: createdProduct, error: productError } = await supabase
      .from('products')
      .insert({
        id: newProductId,
        business_id: business.id,
        name,
        description,
        price,
        stock,
        whatsapp_product_id,
        is_active
      })
      .select()
      .single();

    if (productError) throw productError;

    // Insert images and associations
    if (images.length > 0) {
      const { error: imagesError } = await supabase
        .from('images')
        .insert(images.map(img => ({
          id: img.id,
          path: img.path,
          alt_text: img.alt_text,
          created_at: img.created_at.toISOString()
        })));

      if (imagesError) throw imagesError;

      const { error: assocError } = await supabase
        .from('product_images')
        .insert(images.map((img, i) => ({
          product_id: createdProduct.id,
          image_id: img.id,
          display_order: i
        })));

      if (assocError) throw assocError;
    }

    // Fetch the product again to include the newly associated images
    const productWithImages = await productRepository.getById(business.id, createdProduct.id);

    return NextResponse.json(productWithImages, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
