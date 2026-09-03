import { Package } from "lucide-react";
import { EmptyList } from "@/components/empty-list";
import { OrderWithContactName } from "@/Nenichat/Orders/app/dto/order-with-contact-name";
import { CreateOrderButton } from "@/components/orders/create-order-button";
import { PageHeader } from "@/components/ui/page-header";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { IOrderRepository, OrderTimePeriod } from "@/Nenichat/Orders/domain/IOrderRepository";
import { getBusinessFromUser } from "@/lib/user-auth";
import { OrdersTableClient } from "./orders-table-client";

export const dynamic = 'force-dynamic';

const VALID_PERIODS: OrderTimePeriod[] = ["today", "this_week", "monthly", "yearly", "all"];

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>;
}) {
    const { period: periodParam } = await searchParams;
    const period: OrderTimePeriod = VALID_PERIODS.includes(periodParam as OrderTimePeriod)
        ? (periodParam as OrderTimePeriod)
        : "all";
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>{authError || "No tienes un negocio o no estás autorizado"}</div>;
    }

    const orderRepository: IOrderRepository = new SupabaseOrderRepository(supabase);

    let orders: OrderWithContactName[] = await orderRepository.getAll(business.id, period);

    // Fetch order items for table display
    const BATCH_SIZE = 50;
    for (let i = 0; i < orders.length; i += BATCH_SIZE) {
        const batch = orders.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async order => {
            order.items = await orderRepository.getItems(business.id, order.id);
        }));
    }

    const plainOrders = JSON.parse(JSON.stringify(orders));

    if (plainOrders.length === 0) {
        return (
            <>
                <PageHeader />
                <EmptyList
                    title="Sin ordenes"
                    description="Cuando hagas tu primera orden aparecerá aquí."
                    action={<CreateOrderButton />}
                    icon={<Package className="w-16 h-16 text-primary" strokeWidth={1.5} />}
                />
            </>
        )
    }

    return (
        <>
            <PageHeader title="Ventas">
                <CreateOrderButton />
            </PageHeader>
            <OrdersTableClient
                orders={plainOrders}
            />
        </>
    );
}
