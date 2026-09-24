import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, MapPin, MessageCircle, Package, StickyNote, User, Wallet } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileSummaryCard } from "@/components/profile-summary-card";
import { phoneNumberToJid } from "@/Nenichat/Chats/domain/Jid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import { EditOrderButton } from "@/components/orders/edit-order-button";
import { DropdownMenuDialog } from "@/components/orders/dropdown";
import PaymentStatusDropdown from "@/components/orders/payment-status-dropdown";
import OrderStatusDropdown from "@/components/orders/order-status-dropdown";
import { PageHeader } from "@/components/ui/page-header";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";
import { formatCurrency } from "@/lib/utils";
import { DetailField } from "@/components/detail-field";
import { toDate } from "@/Nenichat/Shared/app/to-date";
import { PAYMENT_METHOD_LABELS } from "@/Nenichat/Orders/app/order-labels";
import { IOrderItemWithProduct } from "@/Nenichat/Orders/domain/IOrderItemWithProduct";

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
    params: Promise<{ orderNumber: string }>;
}

const money = (amount: number) => formatCurrency(Number(amount));

const formatDate = (value: Date | string | null | undefined) => {
    const date = toDate(value);
    return date ? format(date, "PPpp") : null;
};

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

    const subtotal = items.reduce((sum: number, item: IOrderItemWithProduct) => sum + Number(item.total_price), 0);
    const shipping = Number(order.shipping_cost ?? 0);
    const total = Number(order.total_amount);
    const paid = Number(order.amount_paid ?? 0);
    const refunded = Number(order.refunded_amount ?? 0);
    const netPaid = paid - refunded;
    const balance = total - netPaid;
    const isSettled = balance <= 0.005;

    const displayName = contact
        ? (contact.contact_name || contact.pushname || "Nombre desconocido")
        : null;
    const initials = displayName
        ? displayName.split(" ").map((word: string) => word[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
        : "?";
    const whatsappNumber = contact?.phone_number?.replace(/\D/g, "") || null;
    const jidSource = contact?.phone_number || contact?.lid;
    const chatJid = jidSource ? phoneNumberToJid(jidSource) : null;

    const summary = [
        { label: "Total", value: money(total) },
        { label: "Pagado", value: money(paid) },
        {
            label: "Saldo",
            value: money(balance),
            className: isSettled ? "text-emerald-600 dark:text-emerald-500" : "text-amber-600 dark:text-amber-500",
        },
        { label: "Productos", value: String(items.length) },
    ];

    const timeline = [
        { label: "Creado", value: formatDate(order.created_at) },
        { label: "Última actualización", value: formatDate(order.updated_at) },
        { label: "Completado", value: formatDate(order.completed_at) },
        { label: "Cancelado", value: formatDate(order.cancelled_at) },
    ].filter(entry => entry.value);

    return (
        <>
            <PageHeader
                title={`Orden #${order.order_number}`}
                leftContent={<BackButton className="md:hidden" />}
            >
                <div className="hidden md:flex items-center gap-2">
                    <PaymentStatusDropdown order={JSON.parse(JSON.stringify(order))} />
                    <OrderStatusDropdown order={JSON.parse(JSON.stringify(order))} />
                    <Separator orientation="vertical" className="mx-1 h-5" />
                    <EditOrderButton orderId={order.order_number} />
                    <DeleteOrderButton orderId={order.id} />
                </div>
                <div className="md:hidden">
                    <DropdownMenuDialog orderId={order.id} orderNumber={order.order_number} />
                </div>
            </PageHeader>

            <div className="mt-4 space-y-4 pb-4">
                <div className="flex md:hidden items-center gap-2">
                    <PaymentStatusDropdown order={JSON.parse(JSON.stringify(order))} />
                    <OrderStatusDropdown order={JSON.parse(JSON.stringify(order))} />
                </div>

                <ProfileSummaryCard
                    avatarSeed={contact ? displayName ?? "" : ""}
                    initials={contact ? initials : "?"}
                    title={contact ? displayName! : "Sin cliente asociado"}
                    titleClassName={contact ? undefined : "text-muted-foreground"}
                    meta={contact ? (
                        <>
                            {whatsappNumber ? (
                                <p>{contact.phone_number}</p>
                            ) : (
                                <span>Sin teléfono</span>
                            )}
                            {contact.username && <span>@{contact.username}</span>}
                        </>
                    ) : null}
                    actions={contact ? (
                        <>
                            <Button asChild variant="outline" size="sm" className="w-fit">
                                <Link href={`/contacts/${contact.id}`}>
                                    <User className="size-4" />
                                    Ver perfil
                                </Link>
                            </Button>
                            {chatJid && (
                                <Button asChild variant="outline" size="sm" className="w-fit">
                                    <Link href={`/chats/${chatJid}`}>
                                        <MessageCircle className="size-4" />
                                        Ir al chat
                                    </Link>
                                </Button>
                            )}
                        </>
                    ) : null}
                    stats={summary}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="gap-0 overflow-hidden py-0">
                            <div className="flex items-center justify-between border-b px-6 py-4">
                                <h3 className="font-semibold">Productos</h3>
                                <Badge variant="secondary">{items.length}</Badge>
                            </div>

                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                    <Package className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
                                    <p className="text-sm text-muted-foreground">Esta orden no tiene productos.</p>
                                </div>
                            ) : (
                                <>
                                    <Table containerClassName="border-0 rounded-none">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="text-right">Cant.</TableHead>
                                                <TableHead className="text-right">Precio unitario</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item: IOrderItemWithProduct) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.product_name || <span className="text-muted-foreground italic">Producto desconocido</span>}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{money(item.unit_price)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{money(item.total_price)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <div className="space-y-2 border-t px-6 py-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="tabular-nums">{money(subtotal)}</span>
                                        </div>
                                        {shipping > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Envío</span>
                                                <span className="tabular-nums">{money(shipping)}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex items-center justify-between font-semibold">
                                            <span>Total</span>
                                            <span className="text-lg tabular-nums">{money(total)}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>

                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <StickyNote className="size-4 text-muted-foreground" />
                                        Notas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Wallet className="size-4 text-muted-foreground" />
                                    Detalles del pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <DetailField label="Método">
                                        {order.payment_method
                                            ? (PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method)
                                            : "N/A"}
                                    </DetailField>
                                    <DetailField label="Monto pagado">
                                        <span className="tabular-nums">{money(paid)}</span>
                                    </DetailField>
                                    {refunded > 0 && (
                                        <DetailField label="Reembolsado">
                                            <span className="tabular-nums text-destructive">-{money(refunded)}</span>
                                        </DetailField>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="size-4 text-muted-foreground" />
                                    Dirección de envío
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {order.shipping_address ? (
                                    <p className="whitespace-pre-wrap text-sm">{order.shipping_address}</p>
                                ) : (
                                    <p className="text-sm italic text-muted-foreground">Sin dirección</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="size-4 text-muted-foreground" />
                                    Actividad
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    {timeline.map(entry => (
                                        <DetailField key={entry.label} label={entry.label}>
                                            {entry.value}
                                        </DetailField>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
