import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { OrderItemRepository } from "@/Nenichat/Orders/infra/persistance/OrderItemRepository";
import { ContactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import { EditOrderButton } from "@/components/orders/edit-order-button";
import { getPaymentStatusColor, getStatusColor } from "@/lib/utils";

import { DropdownMenuDialog } from "@/components/orders/dropdown";

const orderRepository = new OrderRepository(pool);
const orderItemRepository = new OrderItemRepository(pool);
const contactRepository = new ContactRepository(pool);

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
        notFound();
    }

    const order = await orderRepository.getById(orderId);
    if (!order) {
        notFound();
    }

    const items = await orderItemRepository.getByOrderIdWithProduct(orderId);

    let contact = null;
    if (order.contact_id) {
        // Note: ContactRepository.findById takes a bigint, but our order.contact_id is number.
        // We need to cast it.
        contact = await contactRepository.findById(BigInt(order.contact_id));
    }

    return (
        <div className="container w-full h-full space-y-2 scroll-auto overflow-scroll">
            <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">
                    <Link href="/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Orden #{order.id}</h1>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                        {order.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.payment_status)} variant="outline">
                        {order.payment_status}
                    </Badge>

                    <div className="md:hidden ml-16">
                        <DropdownMenuDialog orderId={orderId} />
                    </div>
                </div>
                <div className="hidden md:flex items-center justify-end gap-2">
                    <EditOrderButton orderId={order.id} />
                    <DeleteOrderButton orderId={order.id} />
                </div>


            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 ">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.product_name || <span className="text-gray-400 italic">Unknown Product</span>}
                                        </TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${Number(item.unit_price).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${Number(item.total_price).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${items.reduce((sum, item) => sum + Number(item.total_price), 0).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-medium">Shipping</TableCell>
                                    <TableCell className="text-right font-medium">${Number(order.shipping_cost).toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                                    <TableCell className="text-right font-bold text-lg">${Number(order.total_amount).toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="">
                    <CardHeader>
                        <CardTitle>Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {contact ? (
                            <>
                                <div className="font-medium text-lg">{contact.contact_name || contact.pushname || 'Unknown Name'}</div>
                                <div className="text-sm text-gray-500">{contact.phone_number}</div>
                                {contact.username && <div className="text-sm text-gray-500">@{contact.username}</div>}
                                <Link href={`/contacts/${contact.id}`} className="text-blue-600 hover:underline text-sm block mt-2">
                                    View Profile
                                </Link>
                            </>
                        ) : (
                            <div className="text-gray-500 italic">No customer attached</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-start-3">
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Method</div>
                                <div className="capitalize">{order.payment_method || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Amount Paid</div>
                                <div>${Number(order.amount_paid).toFixed(2)}</div>
                            </div>
                            {Number(order.refunded_amount) > 0 && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Refunded</div>
                                    <div className="text-red-600">-${Number(order.refunded_amount).toFixed(2)}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {order.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                        </CardContent>
                    </Card>
                )}

                <Card className="md:col-span-1 md:col-start-3">
                    <CardHeader>
                        <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {order.shipping_address ? (
                            <p className="whitespace-pre-wrap">{order.shipping_address}</p>
                        ) : (
                            <p className="text-gray-500 italic">No shipping address provided</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 md:col-start-3">
                    <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Created</div>
                            <div>{format(new Date(order.created_at), "PPpp")}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">Last Updated</div>
                            <div>{format(new Date(order.updated_at), "PPpp")}</div>
                        </div>
                        {order.completed_at && (
                            <div>
                                <div className="text-sm font-medium text-gray-500">Completed</div>
                                <div>{format(new Date(order.completed_at), "PPpp")}</div>
                            </div>
                        )}
                        {order.cancelled_at && (
                            <div>
                                <div className="text-sm font-medium text-gray-500">Cancelled</div>
                                <div>{format(new Date(order.cancelled_at), "PPpp")}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
