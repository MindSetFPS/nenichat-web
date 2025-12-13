import { productRepository } from "@/Nenichat/Products/infra/persistance/ProductRepository";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await productRepository.getById(id);
    if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    productRepository.update(id, { is_active: !product.is_active });

    return NextResponse.json({ message: 'Product updated successfully' });
}