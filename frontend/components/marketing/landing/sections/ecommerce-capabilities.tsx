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
                            Un <span className="text-blue-500">tienda</span> completa. <br />
                            <span className="text-blue-500">Dentro de WhatsApp.</span>
                        </h2>
                        <p className="text-muted-foreground text-xl mb-8">
                            Olvida los enlaces externos desordenados. Dale a tus clientes una experiencia de compra nativa y sin complicaciones con todo lo que esperan de una tienda profesional.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Package className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Sincronización en tiempo real</h3>
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
                                    <h3 className="text-xl font-bold mb-1">Logística Automática</h3>
                                    <p className="text-muted-foreground">
                                        Desde la confirmación del pedido hasta la entrega en su domicilio. Envía actualizaciones de seguimiento y notificaciones de envío directamente en el chat.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <CreditCard className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Pago Nativo</h3>
                                    <p className="text-muted-foreground">
                                        Un viaje de compra sin complicaciones. Los clientes pueden buscar en el catálogo, agregar al carrito y pagar sin salir de la app.
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
                                        <div className="font-bold">Pedido #2481 Confirmado</div>
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
                                        <div className="font-medium">Playera de algodón premium</div>
                                        <div className="text-sm text-muted-foreground">Tamaño: L • Color: Negro</div>
                                    </div>
                                    <div className="font-bold">$299.00</div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>$299.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Envío (Express)</span>
                                    <span>$150.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>$449.00</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <Truck className="h-4 w-4 text-blue-500" />
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">Envío Actualizado</span>
                                </div>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    Tu pedido ha sido enviado! Rastrea tu paquete: <span className="underline cursor-pointer">TRK-8842-XJ</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}