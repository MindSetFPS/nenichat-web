"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { IProduct } from "@/Nenichat/Products/domain/IProduct";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateOrderFormProps {
    contacts: IContact[];
    products: IProduct[];
}

interface OrderItemRow {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export function CreateOrderForm({ contacts, products }: CreateOrderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Order Details
    const [contactId, setContactId] = useState<string>("");
    const [status, setStatus] = useState("pending");

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

    return (
        <form onSubmit={handleSubmit} className="@container grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Customer & Status */}
            <Card className="col-span-2 @md:col-span-1">
                <CardHeader>
                    <CardTitle>Customer & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Customer</Label>
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
            <Card className="col-span-2 @md:col-span-1">
                <CardHeader>
                    <CardTitle>Shipping Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
            <Card className="col-span-2 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Products</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-4 items-end border-b pb-4 last:border-0">
                            <div className="flex-1 space-y-2">
                                <Label>Product</Label>
                                <Select
                                    value={item.productId}
                                    onValueChange={(val) => updateItem(index, "productId", val)}
                                >
                                    <SelectTrigger>
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
                            <div className="w-24 space-y-2">
                                <Label>Qty</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label>Unit Price</Label>
                                <Input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label>Total</Label>
                                <div className="h-10 flex items-center font-medium">
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={() => removeItem(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    <div className="flex justify-end pt-4 text-lg font-bold">
                        Total: ${totalAmount.toFixed(2)}
                    </div>
                </CardContent>
            </Card>

            {/* Payment */}
            <Card className="col-span-2 md:col-span-2">
                <CardHeader>
                    <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
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
                        <div className="space-y-2">
                            <Label>Amount Paid</Label>
                            <Input
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Status</Label>
                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger>
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
