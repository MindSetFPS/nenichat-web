"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { ContactSelectorCombobox } from "@/components/contact-selector-combobox";
import { cn } from "@/lib/utils";
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

    useEffect(() => {
        setIsShippingEnabled(!isMobile);
    }, [isMobile]);

    // Order Details
    const [contactId, setContactId] = useState<string>(initialValues?.contactId || (initialContact ? String(initialContact.id) : ""));
    const [lid, setLid] = useState<string>(initialValues?.lid || (initialContact?.lid ? initialContact.lid : ""));
    const [selectedContact, setSelectedContact] = useState<IContact | undefined>(initialContact);

    // Find initial contact from contacts array if we have contactId or lid but no initialContact
    useEffect(() => {
        if (!initialContact && contacts.length > 0 && (contactId || lid)) {
            const found = contacts.find(c => 
                (contactId && String(c.id) === contactId) || 
                (lid && (c.lid === lid || c.phone_number === lid))
            );
            if (found) {
                setSelectedContact(found);
            }
        }
    }, [contacts, contactId, lid, initialContact]);

    const [status, setStatus] = useState(initialValues?.status || "pending");

    // Items
    const [items, setItems] = useState<OrderItemRow[]>(initialValues?.items || []);

    // Shipping
    const [isShippingEnabled, setIsShippingEnabled] = useState(isMobile);
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

    useEffect(() => {
        if (paymentStatus === "paid") {
            setAmountPaid(totalAmount);
        }

        if (totalAmount == amountPaid && totalAmount > 0) {
            setPaymentStatus("paid");
        }
    }, [paymentStatus, totalAmount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            contactId: contactId || undefined,
            lid: lid || undefined,
            status,
            paymentMethod,
            amountPaid,
            paymentStatus,
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
            <Card className="col-span-2 @md:col-span-1 pt-3 pb-1">
                <CardHeader className="px-2">
                    <CardTitle>Cliente y estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
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
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="processing">Procesando</SelectItem>
                                <SelectItem value="shipped">Enviado</SelectItem>
                                <SelectItem value="delivered">Entregado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-2 @md:col-span-1 pt-3 pb-2">
                <CardHeader className="px-2">
                    <CardTitle>Detalles de envío
                        <Checkbox checked={isShippingEnabled} onCheckedChange={() => setIsShippingEnabled(!isShippingEnabled)} className="ml-2" />
                    </CardTitle>
                </CardHeader>
                {
                    isShippingEnabled && (
                        <CardContent className="space-y-4 px-2">
                            <>
                                <div className="space-y-2">
                                    <Label>Dirección de envío</Label>
                                    <Input
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Ingresar dirección"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Costo de envío</Label>
                                    <Input
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

            <Card className="col-span-2 md:col-span-2 pt-3 pb-2">
                <CardHeader className="flex flex-row items-center justify-between px-2">
                    <CardTitle>Productos</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar artículo
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
                    {items.map((item, index) => (
                        <div key={index}
                            className="flex items-end place-items-start border-b gap-x-2 gap-y-2 pb-4 last:border-0">
                            <div className="w-full space-y-2">
                                <Label>Producto</Label>
                                <Select
                                    value={item.productId}
                                    onValueChange={(val) => updateItem(index, "productId", val)}
                                >
                                    <SelectTrigger className="w-full my-0.5">
                                        <SelectValue placeholder="Seleccionar producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0}>
                                                {p.name} (${p.price}) - Stock: {p.stock}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 max-w-14 mb-0.5">
                                <Label>Cantidad</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 justify-end hidden @md:block">
                                <Label>Precio unitario</Label>
                                <Input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 min-w-20 hidden @md:block">
                                <Label>Total</Label>
                                <div className="h-10 flex items-center font-medium">
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="text-red-500 mb-0.5"
                                onClick={() => removeItem(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    <div className="flex justify-end text-lg font-bold">
                        Total: ${totalAmount.toFixed(2)}
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-2 pt-3 pb-2">
                <CardHeader className="px-2">
                    <CardTitle>Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
                    <div className="grid grid-cols-2 @md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Método de pago</Label>
                            <Select value={paymentMethod} defaultValue="cash" onValueChange={setPaymentMethod}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Efectivo</SelectItem>
                                    <SelectItem value="card">Tarjeta</SelectItem>
                                    <SelectItem value="transfer">Transferencia</SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 w-full">
                            <Label>Estado de pago</Label>
                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger className="w-full">
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
                            paymentStatus === "partial" && (
                                <div className="space-y-2 w-full">
                                    <Label>Importe pagado</Label>
                                    <Input
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            )
                        }

                    </div>
                    <div className="space-y-2">
                        <Label>Notas</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas adicionales..."
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 md:col-span-2">
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
