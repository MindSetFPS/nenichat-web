"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IOrder } from "@/Nenichat/Orders/domain/IOrder";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrdersTableProps {
    orders: IOrder[];
    className?: string;
}

export function OrdersTable({ orders, className }: OrdersTableProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'shipped': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'processing': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'partial': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'refunded': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            default: return 'bg-red-100 text-red-800 hover:bg-red-100';
        }
    };

    return (
        <div className={cn("border rounded-lg overflow-hidden", className)}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No orders found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/orders/${order.id}`} className="hover:underline text-blue-600">
                                        #{order.id}
                                    </Link>
                                </TableCell>
                                <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                                <TableCell>{order.contact_id || 'N/A'}</TableCell>
                                <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(order.status)} variant="outline">
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getPaymentStatusColor(order.payment_status)} variant="outline">
                                        {order.payment_status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
