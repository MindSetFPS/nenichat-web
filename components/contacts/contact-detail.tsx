'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageCircle } from "lucide-react";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { phoneNumberToJid } from "@/Nenichat/Chats/domain/Jid";
import { useContactStore } from "@/stores/contact-store";
import { useChatStore } from "@/stores/chat-store";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSummaryCard } from "@/components/profile-summary-card";
import { DetailField } from "@/components/detail-field";
import { parseGatewayDate } from "@/Nenichat/Shared/app/parse-gateway-date";
import { ORDER_STATUSES, ORDER_STATUS_PLURAL_LABELS, PAYMENT_METHOD_LABELS } from "@/Nenichat/Orders/app/order-labels";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { columns } from "@/components/orders/table/columns";
import { ChatDropDownDialog } from "@/components/chat/chat-dropdown";
import { OrdersByDayChart } from "@/components/contacts/orders-by-day-chart";
import { OrderWithContactName } from "@/Nenichat/Orders/app/dto/order-with-contact-name";
import { cn, formatCurrency } from "@/lib/utils";

/*
 * TODO (contact detail) — deferred, each of these needs a new request or query:
 * - Top products: requires joining orders_products for this contact; getByContactId() returns no items.
 * - Audiencias: GET /api/contacts/[id]/audiences already exists but is unused here; needs a fetch.
 * - Shipment/delivery status: not exposed on the order rows the page receives.
 */

interface ContactDetailProps {
    initialContact: IContact;
    orders: OrderWithContactName[];
    ordersByDay: { day_index: number; count: number }[];
}

const orderStatuses = ORDER_STATUSES.map((status) => ({
    key: status,
    label: ORDER_STATUS_PLURAL_LABELS[status],
}));

export function ContactDetail({ initialContact, orders, ordersByDay }: ContactDetailProps) {
    const router = useRouter();
    const { getContact, setContact } = useContactStore();
    const chats = useChatStore((state) => state.chats);

    useEffect(() => {
        setContact(initialContact);
    }, [initialContact, setContact]);

    const storeContact = getContact(initialContact.phone_number || initialContact.lid!) || initialContact;
    const contactName = storeContact.contact_name || storeContact.pushname || 'Nombre desconocido';

    const initials = contactName
        .split(' ')
        .map((word: string) => word[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';

    const jidSource = storeContact.phone_number || storeContact.lid;
    const chatJid = jidSource ? phoneNumberToJid(jidSource) : null;

    // Orders arrive sorted by created_at desc, so [0] is the newest and the last entry the oldest.
    const totalOrders = orders.length;
    const totalPurchased = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalPaid = orders.reduce((sum, order) => sum + Number(order.amount_paid), 0);
    const totalRefunded = orders.reduce((sum, order) => sum + Number(order.refunded_amount || 0), 0);
    const debt = totalPurchased - totalPaid;
    const averageTicket = totalOrders > 0 ? totalPurchased / totalOrders : 0;

    const lastOrderDate = parseGatewayDate(orders[0]?.created_at);
    const firstOrderDate = parseGatewayDate(orders[totalOrders - 1]?.created_at);
    const lastShippingAddress = orders.find((order) => order.shipping_address)?.shipping_address ?? null;

    const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    const preferredMethod = useMemo(() => {
        const counts = orders.reduce<Record<string, number>>((acc, order) => {
            if (order.payment_method) acc[order.payment_method] = (acc[order.payment_method] || 0) + 1;
            return acc;
        }, {});
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return top ? (PAYMENT_METHOD_LABELS[top[0]] ?? top[0]) : null;
    }, [orders]);

    const lastConversation = useMemo(() => {
        const candidates: string[] = [];
        if (storeContact.phone_number) candidates.push(phoneNumberToJid(storeContact.phone_number));
        if (storeContact.lid) candidates.push(`${storeContact.lid}@lid`);
        const chat = chats.find((candidate) => candidates.includes(candidate.jid));
        return parseGatewayDate(chat?.last_message_time);
    }, [chats, storeContact.phone_number, storeContact.lid]);

    const summary = [
        { label: "Pedidos", value: String(totalOrders) },
        { label: "Total comprado", value: formatCurrency(totalPurchased) },
        { label: "Cobrado", value: formatCurrency(totalPaid) },
        {
            label: "Deuda",
            value: formatCurrency(debt),
            className: debt > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-500",
        },
    ];

    return (
        <>
            <PageHeader
                title={contactName}
                leftContent={<BackButton className="md:hidden" />}
            >
                <ChatDropDownDialog contact={storeContact} />
            </PageHeader>

            <div className="mt-4 space-y-4 pb-4">
                <ProfileSummaryCard
                    avatarSeed={contactName}
                    initials={initials}
                    title={contactName}
                    badge={storeContact.is_hidden ? <Badge variant="secondary" className="shrink-0">Ignorado</Badge> : null}
                    meta={
                        <>
                            <span>{storeContact.phone_number || "Sin teléfono"}</span>
                            {storeContact.username && <span>@{storeContact.username}</span>}
                            {storeContact.lid && (
                                <span className="max-w-[12rem] truncate" title={storeContact.lid}>
                                    LID: {storeContact.lid}
                                </span>
                            )}
                        </>
                    }
                    actions={chatJid ? (
                        <Button asChild variant="outline" size="sm" className="w-fit">
                            <Link href={`/chats/${chatJid}`}>
                                <MessageCircle className="size-4" />
                                Ir al chat
                            </Link>
                        </Button>
                    ) : null}
                    stats={summary}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 min-w-0">
                        <Card className="gap-0 overflow-hidden py-0">
                            <div className="border-b px-6 py-4">
                                <h3 className="font-semibold">Historial de pedidos</h3>
                            </div>
                            <div className="px-6 py-4">
                                <DataTable
                                    columns={columns}
                                    showDateSelector={true}
                                    data={orders}
                                    showSearchInput={false}
                                    selectedDateDefault={"this-month"}
                                    showColumnsVisibilityDropdown={false}
                                    containerClassName="border-0 rounded-none"
                                    onRowClick={(order) => router.push(`/orders/${order.order_number}`)}
                                    visibleColumns={{
                                        contact_id: false,
                                        status: false,
                                        payment_method: false,
                                        refunded_amount: false,
                                        notes: false,
                                        updated_at: false,
                                    }}
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Detalles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <DetailField label="Ticket promedio">
                                        <span className="tabular-nums">{formatCurrency(averageTicket)}</span>
                                    </DetailField>
                                    {totalRefunded > 0 && (
                                        <DetailField label="Reembolsado">
                                            <span className="tabular-nums text-destructive">-{formatCurrency(totalRefunded)}</span>
                                        </DetailField>
                                    )}
                                    {preferredMethod && (
                                        <DetailField label="Método de pago">{preferredMethod}</DetailField>
                                    )}
                                    {lastOrderDate && (
                                        <DetailField label="Última compra">
                                            {formatDistanceToNow(lastOrderDate, { addSuffix: true, locale: es })}
                                        </DetailField>
                                    )}
                                    {firstOrderDate && (
                                        <DetailField label="Cliente desde">
                                            {format(firstOrderDate, "PP")}
                                        </DetailField>
                                    )}
                                    {lastConversation && (
                                        <DetailField label="Última conversación">
                                            {formatDistanceToNow(lastConversation, { addSuffix: true, locale: es })}
                                        </DetailField>
                                    )}
                                    {lastShippingAddress && (
                                        <DetailField label="Última dirección de envío">
                                            <span className="whitespace-pre-wrap">{lastShippingAddress}</span>
                                        </DetailField>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Pedidos por estado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-3">
                                    {orderStatuses.map(({ key, label }) => {
                                        const count = statusCounts[key] ?? 0;
                                        return (
                                            <div key={key} className="flex items-center justify-between">
                                                <dt className="text-sm text-muted-foreground">{label}</dt>
                                                <dd
                                                    className={cn(
                                                        "text-sm tabular-nums",
                                                        count > 0 ? "font-medium" : "text-muted-foreground"
                                                    )}
                                                >
                                                    {count}
                                                </dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Órdenes por día</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <OrdersByDayChart data={ordersByDay} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
