"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/Nenichat/Orders/app/order-labels";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { ContactSelectorCombobox } from "@/components/contact-selector-combobox";
import { cn, formatCurrency } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { IProduct } from "@/Nenichat/Products/domain/IProduct";

export interface OrderItemRow {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderFormValues {
    contactId?: string;
    lid?: string;
    status: string;
    paymentMethod: string;
    amountPaid: number;
    paymentStatus: string;
    notes: string;
    shippingAddress: string;
    shippingCost: number;
    items: OrderItemRow[];
    createdAt?: Date;
}

export interface OrderFormProps {
    initialValues?: Partial<OrderFormValues>;
    onSubmit: (values: OrderFormValues) => Promise<void>;
    contacts: IContact[];
    isLoading?: boolean;
    submitLabel?: string;
    className?: string;
    contact?: IContact; // For pre-fetched contact display
    products: IProduct[];
}

export function OrderForm({
    initialValues,
    onSubmit,
    contacts,
    isLoading = false,
    submitLabel = "Guardar Pedido",
    className,
    contact: initialContact,
    products,
}: OrderFormProps) {
    const isMobile = useIsMobile();

    // Order Details
    const [contactId, setContactId] = useState<string>(initialValues?.contactId || (initialContact ? String(initialContact.id) : ""));
    const [lid, setLid] = useState<string>(initialValues?.lid || (initialContact?.lid ? initialContact.lid : ""));
    const [selectedContact, setSelectedContact] = useState<IContact | undefined>(() => {
        if (initialContact) return initialContact;
        if (contacts.length > 0 && (contactId || lid)) {
            return contacts.find(c =>
                (contactId && String(c.id) === contactId) ||
                (lid && (c.lid === lid || c.phone_number === lid))
            );
        }
        return undefined;
    });

    const [status, setStatus] = useState(initialValues?.status || "pending");

    // Items
    const [items, setItems] = useState<OrderItemRow[]>(initialValues?.items || []);

    // Shipping
    const [isShippingEnabled, setIsShippingEnabled] = useState(!isMobile);
    const [shippingAddress, setShippingAddress] = useState(initialValues?.shippingAddress || "");
    const [shippingCost, setShippingCost] = useState(initialValues?.shippingCost || 0);

    // Payment
    const [paymentMethod, setPaymentMethod] = useState(initialValues?.paymentMethod || "cash");
    const [amountPaid, setAmountPaid] = useState(initialValues?.amountPaid || 0);
    const [paymentStatus, setPaymentStatus] = useState(initialValues?.paymentStatus || "unpaid");
    const [notes, setNotes] = useState(initialValues?.notes || "");

    // Helper to add a new item row
    const addItem = () => {
        setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }]);
    };

    // Helper to remove an item row
    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // Update item fields
    const updateItem = (index: number, field: keyof OrderItemRow, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        if (field === "productId") {
            const product = products.find((p) => p.id === value);
            if (product) {
                item.productId = value;
                item.unitPrice = product.price; // Default to product price
            }
        } else if (field === "quantity" || field === "unitPrice") {
            // @ts-ignore
            item[field] = parseFloat(value) || 0;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    // Calculate totals
    const itemsTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalAmount = itemsTotal + shippingCost;

    const effectivePaymentStatus = totalAmount === amountPaid && totalAmount > 0 ? "paid" : paymentStatus;

    const handlePaymentStatusChange = (newStatus: string) => {
        setPaymentStatus(newStatus);
        if (newStatus === "paid") {
            setAmountPaid(totalAmount);
        }
    };

    const handleAmountPaidChange = (newAmount: number) => {
        setAmountPaid(newAmount);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            contactId: contactId || undefined,
            lid: lid || undefined,
            status,
            paymentMethod,
            amountPaid,
            paymentStatus: effectivePaymentStatus,
            notes,
            shippingAddress,
            shippingCost,
            items: items.filter(i => i.productId),
            createdAt: initialValues?.createdAt,
        });
    };

    const validateStock = () => {
        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            if (product && item.quantity > product.stock) {
                toast.error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
                return false;
            }
        }
        return true;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStock()) return;
        await handleSubmit(e);
    };

    return (
        <form onSubmit={handleFormSubmit} className={cn("@container md:grid grid-cols-1 md:grid-cols-2 space-y-2 md:space-y-0 md:gap-4 p-0 pb-2", className)}>
            <Card className="col-span-2 @md:col-span-1 gap-4 py-4">
                <CardHeader className="px-4">
                    <CardTitle className="text-base">Cliente y estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4">
                    <div className="space-y-2">
                        <Label>Cliente</Label>
                        <ContactSelectorCombobox
                            contacts={contacts}
                            value={selectedContact ?? (contactId || lid)}
                            onChange={(contact) => {
                                setSelectedContact(contact)
                                if (contact) {
                                    setContactId(String(contact.id || ""))
                                    setLid(contact.lid || "")
                                } else {
                                    setContactId("")
                                    setLid("")
                                }
                            }}
                            placeholder="Seleccionar cliente..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger aria-label="Estado de la orden">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_STATUSES.map((value) => (
                                    <SelectItem key={value} value={value}>
                                        {ORDER_STATUS_LABELS[value]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-2 @md:col-span-1 gap-4 py-4">
                <CardHeader className="flex flex-row items-center justify-between px-4">
                    <CardTitle className="text-base">Detalles de envío</CardTitle>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="shipping-enabled"
                            checked={isShippingEnabled}
                            onCheckedChange={() => setIsShippingEnabled(!isShippingEnabled)}
                        />
                        <Label htmlFor="shipping-enabled" className="cursor-pointer font-normal text-muted-foreground">
                            {isShippingEnabled ? "Activado" : "Desactivado"}
                        </Label>
                    </div>
                </CardHeader>
                {
                    isShippingEnabled && (
                        <CardContent className="space-y-4 px-4">
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-address">Dirección de envío</Label>
                                    <Input
                                        id="shipping-address"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Ingresar dirección"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shipping-cost">Costo de envío</Label>
                                    <Input
                                        id="shipping-cost"
                                        type="number"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </>
                        </CardContent>
                    )
                }
            </Card>

            <Card className="col-span-2 md:col-span-2 gap-4 py-4">
                <CardHeader className="flex flex-row items-center justify-between px-4">
                    <CardTitle className="text-base">Productos</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar artículo
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3 px-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed py-8 text-center">
                            <Package className="size-6 text-muted-foreground/60" strokeWidth={1.5} />
                            <p className="text-sm text-muted-foreground">Aún no hay productos en esta orden.</p>
                            <p className="text-xs text-muted-foreground">Usa &quot;Agregar artículo&quot; para comenzar.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-x-2">
                                <span className="flex-1 text-xs font-medium text-muted-foreground">Producto</span>
                                <span className="w-16 text-xs font-medium text-muted-foreground">Cantidad</span>
                                <span className="hidden @md:block w-24 text-xs font-medium text-muted-foreground">Precio unit.</span>
                                <span className="hidden @md:block w-24 text-xs font-medium text-muted-foreground">Total</span>
                                <span className="hidden @md:block w-9" />
                            </div>

                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-x-2">
                                    <div className="flex-1 min-w-0">
                                        <Select
                                            value={item.productId}
                                            onValueChange={(val) => updateItem(index, "productId", val)}
                                        >
                                            <SelectTrigger className="w-full" aria-label={`Producto ${index + 1}`}>
                                                <SelectValue placeholder="Seleccionar producto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((p) => (
                                                    <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0} className="max-w-[calc(100vw-4rem)] md:max-w-md">
                                                        <span className="truncate">
                                                            {p.name} ({formatCurrency(p.price)}) - {p.stock} unidades
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                        className="w-16"
                                        aria-label={`Cantidad del producto ${index + 1}`}
                                    />

                                    <Input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                        className="hidden @md:block w-24"
                                        aria-label={`Precio unitario del producto ${index + 1}`}
                                    />

                                    <div className="hidden @md:flex h-9 w-24 items-center font-medium tabular-nums">
                                        {formatCurrency(item.quantity * item.unitPrice)}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeItem(index)}
                                        aria-label={`Quitar producto ${index + 1}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            <div className="flex flex-col items-end gap-1 border-t pt-3">
                                <div className="flex w-full max-w-56 items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="tabular-nums">{formatCurrency(itemsTotal)}</span>
                                </div>
                                {shippingCost > 0 && (
                                    <div className="flex w-full max-w-56 items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Envío</span>
                                        <span className="tabular-nums">{formatCurrency(shippingCost)}</span>
                                    </div>
                                )}
                                <div className="flex w-full max-w-56 items-center justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-lg tabular-nums">{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-2 gap-4 py-4">
                <CardHeader className="px-4">
                    <CardTitle className="text-base">Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4">
                    <div className="grid grid-cols-2 @md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Método de pago</Label>
                            <Select value={paymentMethod} defaultValue="cash" onValueChange={setPaymentMethod}>
                                <SelectTrigger className="w-full" aria-label="Método de pago">
                                    <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 w-full">
                            <Label>Estado de pago</Label>
                            <Select value={effectivePaymentStatus} onValueChange={handlePaymentStatusChange}>
                                <SelectTrigger className="w-full" aria-label="Estado de pago">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unpaid">No pagado</SelectItem>
                                    <SelectItem value="partial">Parcial</SelectItem>
                                    <SelectItem value="paid">Pagado</SelectItem>
                                    <SelectItem value="refunded">Reembolsado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {
                            effectivePaymentStatus === "partial" && (
                                <div className="space-y-2 w-full">
                                    <Label htmlFor="amount-paid">Importe pagado</Label>
                                    <Input
                                        id="amount-paid"
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => handleAmountPaidChange(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )
                        }

                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="order-notes">Notas</Label>
                        <Textarea
                            id="order-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas adicionales..."
                            className="min-h-20"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 border-t pt-4 md:col-span-2">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || totalAmount === 0} >
                    {isLoading ? "Guardando..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
