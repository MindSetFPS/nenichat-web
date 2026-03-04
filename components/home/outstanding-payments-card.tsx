"use client";

import { Card } from "@/components/ui/card";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { AlertCircle, User, Phone } from "lucide-react";
import Link from "next/link";

interface OutstandingPayment {
    id: number;
    total_amount: number;
    amount_paid: number;
    payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
    contact: IContact | null;
    created_at: Date;
}

interface OutstandingPaymentsCardProps {
    payments: OutstandingPayment[];
}

export function OutstandingPaymentsCard({ payments }: OutstandingPaymentsCardProps) {
    if (payments.length === 0) return null;

    const totalOutstanding = payments.reduce((acc, order) => {
        return acc + (Number(order.total_amount) - Number(order.amount_paid));
    }, 0);

    return (
        <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
            <div className="p-6 pb-0">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Pagos Pendientes
                </h3>
                <p className="text-sm text-muted-foreground">
                    {payments.length} pedido{payments.length !== 1 ? 's' : ''} con pago pendiente
                </p>
            </div>
            <div className="p-6 pt-2">
                <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        Total pendiente: 
                        <span className="ml-2 text-lg font-bold">
                            ${totalOutstanding.toLocaleString('es-AR')}
                        </span>
                    </p>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {payments.map((order) => {
                        const outstanding = Number(order.total_amount) - Number(order.amount_paid);
                        const customerName = order.contact?.contact_name || order.contact?.username || order.contact?.pushname || 'Cliente sin nombre';
                        const customerPhone = order.contact?.phone_number || 'Sin teléfono';
                        const contactHref = order.contact?.id ? `/contacts/${order.contact.id}` : '#';

                        return (
                            <Link 
                                key={order.id}
                                href={contactHref}
                                className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-medium text-sm truncate">
                                            {customerName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground truncate">
                                            {customerPhone}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="font-bold text-sm text-amber-600 dark:text-amber-400">
                                        ${outstanding.toLocaleString('es-AR')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.payment_status === 'unpaid' ? 'Sin pagar' : 'Parcial'}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
