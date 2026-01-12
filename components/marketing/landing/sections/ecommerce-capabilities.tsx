import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Package, ShoppingBag, Truck } from "lucide-react";

export default function EcommerceCapabilities() {
    return (
        <section id="ecommerce-capabilities" className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <Badge variant="outline" className="mb-4 border-blue-500/20 text-blue-500 bg-blue-500/5">End-to-End Commerce</Badge>
                        <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                            Un <span className="text-blue-500">ecommerce</span> completo. <br />
                            <span className="text-blue-500">En tus chats.</span>
                        </h2>
                        <p className="text-muted-foreground text-xl mb-8">
                            Convierte cada chat en una caja registradora. Carga tus productos, genera órdenes y controla quién ya pagó y quién falta, todo en una sola app.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Package className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Tu Catálogo nunca miente</h3>
                                    <p className="text-muted-foreground">
                                        Si vendes la última pieza, se marca como agotado automáticamente. Adiós a la pena de decirle al cliente: "Uy nena, ya se me acabó, te quedo mal".                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Truck className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">De "Pendiente" a "Enviado".</h3>
                                    <p className="text-muted-foreground">
                                        Organiza el caos con etiquetas de colores en cada chat: 🔴 Por Pagar, 🟡 Empacando, 🟢 Enviado. Nunca más volverás a enviar un paquete sin haber confirmado el cobro primero.                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <CreditCard className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Cobra como quieras (incluso Transferencias).</h3>
                                    <p className="text-muted-foreground">
                                        Acepta tarjeta, link de pago o detecta automáticamente los comprobantes de transferencia y efectivo. Centralizamos el dinero para que sepas exactamente cuánto ganaste hoy.                                    </p>
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
                                        <div className="text-xs text-muted-foreground">Hace 2 minutos</div>
                                    </div>
                                </div>
                                <Badge className="bg-green-500 align-middle pt-1 hover:bg-green-600">Pagado</Badge>
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
                                <div className="flex  gap-3 mb-2">
                                    <Truck className="h-5 w-auto text-blue-500" />
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">Listo para envíar</span>
                                </div>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    El paquete ha sido pagado y está listo para ser enviado. Codigo de rastreo:<span className="underline cursor-pointer">TRK-8842-XJ</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}