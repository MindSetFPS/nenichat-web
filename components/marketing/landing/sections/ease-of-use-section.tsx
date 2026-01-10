import { MessageSquare, ShoppingCart, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function EaseOfUseSection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">Simplicity First</Badge>
                    <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                        Todo lo que necesitas, <br />
                        <span className="text-primary">sin complicaciones</span>
                    </h2>
                    <p className="text-muted-foreground text-xl">
                        Una app diseñada para que vendas más, no para que pierdas tiempo aprendiendo a usarla.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Block 1: Chats */}
                    <div className="group relative overflow-hidden rounded-3xl border bg-muted/20 hover:bg-muted/30 transition-colors duration-300 p-8 flex flex-col h-full">
                        <div className="mb-6">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 w-fit mb-4">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Chats Centralizados</h3>
                            <p className="text-muted-foreground">
                                Gestiona todas tus conversaciones en un solo lugar. Etiquetas, notas y respuestas rápidas al alcance de un clic.
                            </p>
                        </div>
                        <div className="mt-auto relative w-full aspect-video rounded-xl overflow-hidden bg-background border shadow-sm">
                            {/* Placeholder for Chat UI */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-medium text-lg">
                                Chat Interface Preview
                            </div>
                            {/* Abstract UI representation */}
                            <div className="absolute top-4 left-4 right-4 space-y-3 opacity-50">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted-foreground/20"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-muted-foreground/20 rounded"></div>
                                        <div className="h-4 w-1/2 bg-muted-foreground/20 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-primary/20 rounded ml-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block 2: Orders */}
                    <div className="group relative overflow-hidden rounded-3xl border bg-muted/20 hover:bg-muted/30 transition-colors duration-300 p-8 flex flex-col h-full">
                        <div className="mb-6">
                            <div className="p-3 rounded-2xl bg-green-500/10 text-green-500 w-fit mb-4">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Pedidos en un Click</h3>
                            <p className="text-muted-foreground">
                                Crea órdenes directamente desde el chat. El sistema detecta productos y calcula totales automáticamente.
                            </p>
                        </div>
                        <div className="mt-auto relative w-full aspect-video rounded-xl overflow-hidden bg-background border shadow-sm">
                            {/* Placeholder for Orders UI */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-medium text-lg">
                                Order Flow Preview
                            </div>
                            {/* Abstract UI representation */}
                            <div className="absolute inset-4 space-y-3 opacity-50">
                                <div className="h-8 w-full bg-muted-foreground/10 rounded flex items-center px-3 justify-between">
                                    <div className="h-3 w-1/3 bg-muted-foreground/20 rounded"></div>
                                    <div className="h-3 w-10 bg-green-500/20 rounded"></div>
                                </div>
                                <div className="h-8 w-full bg-muted-foreground/10 rounded flex items-center px-3 justify-between">
                                    <div className="h-3 w-1/2 bg-muted-foreground/20 rounded"></div>
                                    <div className="h-3 w-10 bg-green-500/20 rounded"></div>
                                </div>
                                <div className="h-px w-full bg-border my-2"></div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-16 bg-muted-foreground/30 rounded"></div>
                                    <div className="h-4 w-16 bg-muted-foreground/30 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block 3: Products */}
                    <div className="group relative overflow-hidden rounded-3xl border bg-muted/20 hover:bg-muted/30 transition-colors duration-300 p-8 flex flex-col h-full">
                        <div className="mb-6">
                            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 w-fit mb-4">
                                <Package className="h-6 w-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Catálogo Sincronizado</h3>
                            <p className="text-muted-foreground">
                                Tu inventario siempre al día. Comparte productos con fotos y descripciones sin salir de WhatsApp.
                            </p>
                        </div>
                        <div className="mt-auto relative w-full aspect-video rounded-xl overflow-hidden bg-background border shadow-sm">
                            {/* Placeholder for Products UI */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-medium text-lg">
                                Catalog Preview
                            </div>
                            {/* Abstract UI representation */}
                            <div className="absolute inset-4 grid grid-cols-2 gap-2 opacity-50">
                                <div className="bg-muted-foreground/10 rounded-lg p-2 space-y-2">
                                    <div className="w-full aspect-square bg-muted-foreground/20 rounded-md"></div>
                                    <div className="h-2 w-2/3 bg-muted-foreground/20 rounded"></div>
                                </div>
                                <div className="bg-muted-foreground/10 rounded-lg p-2 space-y-2">
                                    <div className="w-full aspect-square bg-muted-foreground/20 rounded-md"></div>
                                    <div className="h-2 w-2/3 bg-muted-foreground/20 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
