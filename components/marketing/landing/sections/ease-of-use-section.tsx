import { MessageSquare, ShoppingCart, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EaseOfUseCard } from "./ease-of-use-card"
import Image from "next/image"

export default function EaseOfUseSection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">Simplicity First</Badge>
                    <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                        Todo lo que necesitas, <br /><span className="text-primary">sin complicaciones</span>
                    </h2>
                    <p className="text-muted-foreground text-xl">
                        Una app diseñada para que vendas más, no para que pierdas tiempo aprendiendo a usarla.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Block 1: Chats */}
                    <EaseOfUseCard
                        icon={MessageSquare}
                        title="Chats Centralizados"
                        description="Gestiona todas tus conversaciones en un solo lugar. Etiquetas, notas y respuestas rápidas al alcance de un clic."
                        iconWrapperClassName="bg-blue-500/10 text-blue-500"
                    >
                        {/* Placeholder image */}
                        <Image
                            unoptimized={true}
                            src="https://placehold.co/600x400"
                            alt="Chat Interface Preview"
                            width={500}
                            height={500}
                            className="w-full h-auto"
                        />
                    </EaseOfUseCard>



                    {/* Block 2: Orders */}
                    <EaseOfUseCard
                        icon={ShoppingCart}
                        title="Pedidos en un Click"
                        description="Crea órdenes directamente desde el chat. El sistema detecta productos y calcula totales automáticamente."
                        iconWrapperClassName="bg-green-500/10 text-green-500"
                    >
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
                    </EaseOfUseCard>


                    {/* Block 3: Products */}
                    <EaseOfUseCard
                        icon={Package}
                        title="Catálogo Sincronizado"
                        description="Tu inventario siempre al día. Comparte productos con fotos y descripciones sin salir de WhatsApp."
                        iconWrapperClassName="bg-purple-500/10 text-purple-500"
                    >
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
                    </EaseOfUseCard>



                </div>
            </div>
        </section>
    )
}
