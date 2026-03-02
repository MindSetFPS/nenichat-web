import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';
import { v4 as uuidv4 } from 'uuid';

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

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const active_only = searchParams.get('active_only') === 'true';

    let query = supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (active_only) {
      query = query.eq('is_active', true);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    return NextResponse.json(products || [], { status: 200 });
  } catch (error) {
    console.error('Error listing products:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

/**
 * @function POST
 * @description Handles POST requests to create a new product.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {NextResponse} The response containing the created product or an error.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  try {
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

    const { data: createdProduct, error: productError } = await supabase
      .from('products')
      .insert({
        id: uuidv4(),
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

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    const message = error?.message || error?.details || String(error);
    return NextResponse.json({ error: 'Failed to create product', details: message }, { status: 500 });
  }
}
