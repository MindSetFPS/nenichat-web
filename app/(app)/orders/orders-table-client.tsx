"use client"

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/orders/table/columns";
import { OrderWithContactName } from "@/Nenichat/Orders/app/dto/order-with-contact-name";

interface OrdersTableClientProps {
    orders: OrderWithContactName[];
}

export function OrdersTableClient({ orders }: OrdersTableClientProps) {
    const router = useRouter();

    const handleRowClick = (order: OrderWithContactName) => {
        router.push(`/orders/${order.id}`);
    };

    return (
        <DataTable
            columns={columns}
            data={orders}
            searchInputColumnId="id"
            showDateSelector={true}
            showSearchInput={false}
            visibleColumns={{
                "updated_at": false,
                "status": false,
                "payment_method": false,
                "refunded_amount": false,
                "notes": false,
                "amount_paid": false,
            }}
            onRowClick={handleRowClick}
        />
    );
}
