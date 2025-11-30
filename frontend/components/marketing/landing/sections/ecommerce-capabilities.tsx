import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Package, ShoppingBag, Truck } from "lucide-react";

export default function EcommerceCapabilities() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <Badge variant="outline" className="mb-4 border-blue-500/20 text-blue-500 bg-blue-500/5">End-to-End Commerce</Badge>
                        <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                            A Full E-commerce Store. <br />
                            <span className="text-blue-500">Inside WhatsApp.</span>
                        </h2>
                        <p className="text-muted-foreground text-xl mb-8">
                            Forget clunky external links. Give your customers a seamless, native shopping experience with everything they expect from a professional store.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Package className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Live Inventory Sync</h3>
                                    <p className="text-muted-foreground">
                                        Real-time unit tracking. When a product sells, stock updates instantly across all active chats. Never oversell again.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Truck className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Automated Logistics</h3>
                                    <p className="text-muted-foreground">
                                        From order confirmation to delivery at their doorstep. Send automated tracking updates and shipping notifications directly in the chat.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <CreditCard className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Native Checkout</h3>
                                    <p className="text-muted-foreground">
                                        A frictionless purchasing journey. Customers can browse catalogs, add to cart, and pay without ever leaving the app.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Abstract representation of the e-commerce engine */}
                        <div className="absolute inset-0 bg-linear-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10"></div>
                        <div className="bg-background border rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8 border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Order #2481 Confirmed</div>
                                        <div className="text-xs text-muted-foreground">Just now</div>
                                    </div>
                                </div>
                                <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex gap-4 items-center p-3 bg-muted/50 rounded-xl">
                                    <div className="h-12 w-12 bg-white rounded-lg border flex items-center justify-center">
                                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">Premium Cotton T-Shirt</div>
                                        <div className="text-sm text-muted-foreground">Size: L • Color: Black</div>
                                    </div>
                                    <div className="font-bold">$29.00</div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>$29.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping (Express)</span>
                                    <span>$5.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>$34.00</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <Truck className="h-4 w-4 text-blue-500" />
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">Shipping Update</span>
                                </div>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    Your order has been shipped! Track your package: <span className="underline cursor-pointer">TRK-8842-XJ</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}