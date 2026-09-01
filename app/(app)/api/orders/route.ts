import { NextRequest, NextResponse } from "next/server";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";
import { OrderTimePeriod } from "@/Nenichat/Orders/domain/IOrderRepository";

const VALID_PERIODS: OrderTimePeriod[] = ["today", "this_week", "monthly", "yearly", "all"];

export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const periodParam = request.nextUrl.searchParams.get('period');
    const period: OrderTimePeriod = VALID_PERIODS.includes(periodParam as OrderTimePeriod)
        ? (periodParam as OrderTimePeriod)
        : "all";

    const orderRepository = new SupabaseOrderRepository(supabase);

    try {
        const orders = await orderRepository.getAll(business.id, period);
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

