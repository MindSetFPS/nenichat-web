import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { OrderItemRepository } from "@/Nenichat/Orders/infra/persistance/OrderItemRepository";
import { ContactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
                <Badge className={getStatusColor(order.status)} variant="outline">
                    {order.status}
                </Badge>
                <Badge className={getPaymentStatusColor(order.payment_status)} variant="outline">
                    {order.payment_status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items */}
                    <Card>
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

                    {/* Payment Info */}
                    <Card>
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

                    {/* Notes */}
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
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
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

                    {/* Shipping Address */}
                    <Card>
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

                    {/* Meta */}
                    <Card>
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
