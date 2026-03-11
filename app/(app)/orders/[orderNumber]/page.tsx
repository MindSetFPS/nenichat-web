import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { format } from "date-fns";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import { EditOrderButton } from "@/components/orders/edit-order-button";
import { DropdownMenuDialog } from "@/components/orders/dropdown";
import PaymentStatusDropdown from "@/components/orders/payment-status-dropdown";
import OrderStatusDropdown from "@/components/orders/order-status-dropdown";
import { PageHeader } from "@/components/ui/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";
import { IOrderItemWithProduct } from "@/Nenichat/Orders/domain/IOrderItemWithProduct";

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
    params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { orderNumber } = await params;
    const orderNum = parseInt(orderNumber);

    if (isNaN(orderNum)) notFound()

    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>No autorizado</div>;
    }

    const orderRepository = new SupabaseOrderRepository(supabase);
    const contactRepository = new SupabaseContactRepository(supabase);

    const order = await orderRepository.getByOrderNumber(business.id, orderNum);
    if (!order) notFound()

    const items = await orderRepository.getItems(business.id, order.id);

    let contact = null;
    if (order.contact_id) {
        contact = await contactRepository.findById(business.id, Number(order.contact_id));
    }

    return (
        <>
            <PageHeader
                title={`Orden #${order.order_number}`}
                leftContent={<BackButton className="md:hidden" />}
            >
                <div className="hidden md:flex items-center gap-2">
                    <PaymentStatusDropdown order={JSON.parse(JSON.stringify(order))} />
                    <OrderStatusDropdown order={JSON.parse(JSON.stringify(order))} />
                </div>
                <div className="hidden md:flex items-center justify-end gap-2">
                    <EditOrderButton orderId={order.order_number} />
                    <DeleteOrderButton orderId={order.order_number} />
                </div>
                <div className="md:hidden">
                    <DropdownMenuDialog orderId={order.order_number} />
                </div>
            </PageHeader>

            <div className="container w-full h-full space-y-2 mt-2 md:mt-0">
                <div className="flex md:hidden items-center gap-2 w-full">
                    <div className="">
                        <PaymentStatusDropdown order={JSON.parse(JSON.stringify(order))} />
                    </div>
                    <div className="">
                        <OrderStatusDropdown order={JSON.parse(JSON.stringify(order))} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2 mt-2">
                    <div className="md:col-span-2 py-0 gap-2">
                        <Table className="bg-card">
                            <TableHeader>
                                <TableRow className="border-none border-0">
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Cant.</TableHead>
                                    <TableHead className="text-right">Precio Unitario</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="border-none border-0">
                                {items.map((item: IOrderItemWithProduct) => (
                                    <TableRow key={item.id} className="border-none border-0">
                                        <TableCell className="font-medium">
                                            {item.product_name || <span className="text-gray-400 italic">Producto desconocido</span>}
                                        </TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${Number(item.unit_price).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${Number(item.total_price).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${items.reduce((sum: number, item: IOrderItemWithProduct) => sum + Number(item.total_price), 0).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                                {
                                    order.shipping_cost > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-medium">Envío</TableCell>
                                            <TableCell className="text-right font-medium">${Number(order.shipping_cost).toFixed(2)}</TableCell>
                                        </TableRow>
                                    )
                                }
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                                    <TableCell className="text-right font-bold text-lg">${Number(order.total_amount).toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <Card className="">
                        <CardHeader>
                            <CardTitle>Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contact ? (
                                <>
                                    <div className="font-medium text-lg">{contact.contact_name || contact.pushname || 'Nombre desconocido'}</div>
                                    <div className="text-sm text-gray-500">{contact.phone_number}</div>
                                    {contact.username && <div className="text-sm text-gray-500">@{contact.username}</div>}
                                    <Link href={`/contacts/${contact.id}`} className="text-blue-600 hover:underline text-sm block mt-2">
                                        Ver perfil
                                    </Link>
                                </>
                            ) : (
                                <div className="text-gray-500 italic">Sin cliente asociado</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-start-3">
                        <CardHeader>
                            <CardTitle>Detalles del pago</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Método</div>
                                    <div className="capitalize">{order.payment_method || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Cantidad</div>
                                    <div>${Number(order.amount_paid).toFixed(2)}</div>
                                </div>
                                {Number(order.refunded_amount) > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Reembolsado</div>
                                        <div className="text-red-600">-${Number(order.refunded_amount).toFixed(2)}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="md:col-span-1 md:col-start-3">
                        <CardHeader>
                            <CardTitle>Dirección de envío</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.shipping_address ? (
                                <p className="whitespace-pre-wrap">{order.shipping_address}</p>
                            ) : (
                                <p className="text-gray-500 italic">Sin dirección</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1 md:col-start-3">
                        <CardHeader>
                            <CardTitle>Línea de tiempo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Creado</div>
                                <div>{order.created_at && !isNaN(order.created_at.getTime()) ? format(order.created_at, "PPpp") : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Última actualización</div>
                                <div>{order.updated_at && !isNaN(order.updated_at.getTime()) ? format(order.updated_at, "PPpp") : 'N/A'}</div>
                            </div>
                            {order.completed_at && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Completado</div>
                                    <div>{format(new Date(order.completed_at), "PPpp")}</div>
                                </div>
                            )}
                            {order.cancelled_at && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Cancelado</div>
                                    <div>{format(new Date(order.cancelled_at), "PPpp")}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
