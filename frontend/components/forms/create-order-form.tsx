"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useProductStore } from "@/stores/product-store";
import { cn } from "@/lib/utils";

interface CreateOrderFormProps {
    contacts?: IContact[];
    contactId?: string;
    contact?: IContact;
    className?: string;
}

interface OrderItemRow {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export function CreateOrderForm({ contacts, contactId: initialContactId, contact: initialContact, className }: CreateOrderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { products, fetchProducts } = useProductStore();

    // Order Details
    const [contactId, setContactId] = useState<string>(initialContactId || (initialContact ? String(initialContact.id) : ""));
    const [status, setStatus] = useState("pending");

    // Contact Data State
    const [fetchedContact, setFetchedContact] = useState<IContact | null>(initialContact || null);
    const [isFetchingContact, setIsFetchingContact] = useState(false);

    // Items
    const [items, setItems] = useState<OrderItemRow[]>([]);

    // Shipping
    const [shippingAddress, setShippingAddress] = useState("");
    const [shippingCost, setShippingCost] = useState(0);

    // Payment
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amountPaid, setAmountPaid] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState("unpaid");
    const [notes, setNotes] = useState("");

    // Fetch contact if only ID is provided
    useEffect(() => {
        const fetchContact = async () => {
            if (initialContactId && !initialContact && !contacts?.find(c => String(c.id) === initialContactId)) {
                setIsFetchingContact(true);
                try {
                    const response = await fetch(`/api/contacts/${initialContactId}`);
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
    }, [initialContactId, initialContact, contacts]);

    useEffect(() => {
        fetchProducts();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                contact_id: contactId ? parseInt(contactId) : null,
                items: items.filter(i => i.productId), // Only send items with selected product
                shipping_address: shippingAddress,
                shipping_cost: shippingCost,
                status,
                payment_method: paymentMethod,
                amount_paid: amountPaid,
                payment_status: paymentStatus,
                notes,
                total_amount: totalAmount
            };

            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to create order");
            }

            toast.success("Order created successfully");
            router.push("/orders");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    // Determine display contact
    const displayContact = fetchedContact || (contacts ? contacts.find(c => String(c.id) === contactId) : null);
    const showContactSelect = contacts && contacts.length > 0 && !initialContactId && !initialContact;

    return (
        <form onSubmit={handleSubmit} className={cn("@container grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 p-0 pb-2", className)}>
            {/* Customer & Status */}
            <Card className="col-span-2 @md:col-span-1 pt-3 pb-1">
                <CardHeader className="px-2">
                    <CardTitle>Customer & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
                    <div className="space-y-2">
                        <Label>Customer</Label>
                        {showContactSelect ? (
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
                            <div className="p-3 border rounded-md bg-muted/50">
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

            {/* Shipping Info */}
            <Card className="col-span-2 @md:col-span-1 pt-3 pb-2">
                <CardHeader className="px-2">
                    <CardTitle>Shipping Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
                    <div className="space-y-2">
                        <Label>Shipping Address</Label>
                        <Input
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Enter address"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Shipping Cost</Label>
                        <Input
                            type="number"
                            value={shippingCost}
                            onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Products */}
            <Card className="col-span-2 md:col-span-2 pt-3 pb-2">
                <CardHeader className="flex flex-row items-center justify-between px-2">
                    <CardTitle>Products</CardTitle>
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
                                <Label>Product</Label>
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
                                <Label>Qty</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 justify-end hidden @md:block">
                                <Label>Unit Price</Label>
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

            {/* Payment */}
            <Card className="col-span-2 md:col-span-2 pt-3 pb-2">
                <CardHeader className="px-2">
                    <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
                    <div className="grid grid-cols-2 @md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                            <Label>Payment Status</Label>
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

                        <div className="space-y-2 w-full">
                            <Label>Amount Paid</Label>
                            <Input
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                            />
                        </div>

                    </div>
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes..."
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 md:col-span-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Order"}
                </Button>
            </div>
        </form>
    );
}
