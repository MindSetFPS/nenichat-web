"use client";

import { useState, useEffect } from "react";
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
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { IProduct } from "@/Nenichat/Products/domain/IProduct";

export interface OrderItemRow {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderFormValues {
    contactId: string;
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
    submitLabel = "Save Order",
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
    const [status, setStatus] = useState(initialValues?.status || "pending");

    // Contact Data State
    const [fetchedContact, setFetchedContact] = useState<IContact | null>(initialContact || null);
    const [isFetchingContact, setIsFetchingContact] = useState(false);

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

    // Fetch contact if only ID is provided and not in contacts list
    useEffect(() => {
        const fetchContact = async () => {
            if (contactId && !initialContact && !contacts?.find(c => String(c.id) === contactId)) {
                setIsFetchingContact(true);
                try {
                    const response = await fetch(`/api/contacts/${contactId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFetchedContact(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch contact", error);
                    toast.error("Failed to load contact details");
                } finally {
                    setIsFetchingContact(false);
                }
            }
        };

        fetchContact();
    }, [contactId, initialContact, contacts]);

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
            contactId,
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

    // Determine display contact
    const displayContact = fetchedContact || (contacts ? contacts.find(c => String(c.id) === contactId) : null);
    const showContactSelect = contacts && contacts.length > 0 && !contactId && !initialContact && !fetchedContact;
    // Determine if we should show the select or the display box. 
    // If we have a selected contactId, show the display box (which might be loading).
    // If we don't have a selected contactId, show the select.

    // Correction on logic:
    // If `contactId` is set, we show the display box (unless we want to allow changing it easily, but the original UI seemed to lock it or show it in a specific way).
    // The original UI logic:
    // const showContactSelect = contacts && contacts.length > 0 && !initialContactId && !initialContact;
    // Here we use internal state `contactId`.

    // Let's refine `showContactSelect` to mimic original behavior but also allow selecting if nothing is selected.
    const effectiveShowContactSelect = !contactId && contacts && contacts.length > 0;

    return (
        <form onSubmit={handleSubmit} className={cn("@container md:grid grid-cols-1 md:grid-cols-2 space-y-2 md:space-y-0 md:gap-4 p-0 pb-2", className)}>
            <Card className="col-span-2 @md:col-span-1 pt-3 pb-1">
                <CardHeader className="px-2">
                    <CardTitle>Cliente y estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
                    <div className="space-y-2">
                        <Label>Customer</Label>
                        {effectiveShowContactSelect ? (
                            <Select value={contactId} onValueChange={setContactId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map((contact) => (
                                        <SelectItem key={contact.id} value={String(contact.id)}>
                                            {contact.contact_name || contact.pushname || contact.phone_number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="p-3 border rounded-md bg-muted/50 flex justify-between items-center">
                                {isFetchingContact ? (
                                    <span className="text-sm text-muted-foreground">Loading contact...</span>
                                ) : displayContact ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium">{getContactIdentifier(displayContact)}</span>
                                        <span className="text-sm text-muted-foreground">{displayContact.phone_number}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground">No contact selected</span>
                                )}
                                {/* Allow clearing selection if it wasn't an initial mandated contact? For now keep simple like original */}
                                {contactId && !initialValues?.contactId && !initialContact && (
                                    <Button variant="ghost" size="sm" onClick={() => setContactId("")} type="button">Change</Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                                        placeholder="Enter address"
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
                        Add Item
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
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} (${p.price})
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
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
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
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
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
                    {isLoading ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
