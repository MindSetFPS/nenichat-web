import { pool } from "@/repository/db";
import { OrderRepository } from "@/repository/OrderRepository";
import { OrdersTable } from "@/components/orders-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const orderRepository = new OrderRepository(pool);

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const orders = await orderRepository.getAll();

    // Serialize for client component
    const plainOrders = JSON.parse(JSON.stringify(orders));

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <Link href="/orders/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Order
                    </Button>
                </Link>
            </div>
            <OrdersTable orders={plainOrders} />
        </div>
    );
}
