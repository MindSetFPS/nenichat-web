import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";
import { SupabaseProductRepository } from "@/Nenichat/Products/infra/persistance/SupabaseProductRepository";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
        return NextResponse.json({ error: 'Invalid is_active value' }, { status: 400 });
    }

    const productRepository = new SupabaseProductRepository(supabase);

    const product = await productRepository.getById(business.id, id);
    if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    try {
        await productRepository.update(business.id, id, { is_active });
        return NextResponse.json({ message: 'Product updated successfully' });
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}