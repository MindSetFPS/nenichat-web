import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingCard } from "../../pricing-card";
import { BarChart, Check, Crown, MessageSquare, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/ui/shine-border";

export default function PricingSection() {
    return (
        <section id="pricing" className="py-20 bg-muted/50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

                    {/* Nivel 1: Neni Starter */}
                    <Card className="flex flex-col border-muted hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                        <CardHeader>
                            <div className="mb-2 text-primary font-bold tracking-wide uppercase text-sm">Nivel 1</div>
                            <CardTitle className="text-3xl font-bold">Starter</CardTitle>
                            <CardDescription className="text-lg mt-2">Vende por chat</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-5xl font-extrabold">$0</span>
                                <span className="text-muted-foreground"> / mes</span>
                            </div>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Ideal para empezar. Trae tu numero y empieza en minutos.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>Catálogo Digital <strong>ilimitado</strong></span>
                                </li>
                                {/* <li className="flex items-start gap-3 text-sm">
                                            <Check className="h-5 w-5 text-green-500 shrink-0" />
                                            <span>"Neni Link" para Bio (con carrito)</span>
                                        </li> */}
                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>Generador de Pedidos Manual</span>
                                </li>
                                {/* <li className="flex items-start gap-3 text-sm">
                                            <Zap className="h-5 w-5 text-yellow-500 shrink-0" />
                                            <span><strong>Validación de Transferencias (OCR)</strong><br /><span className="text-xs text-muted-foreground">30 al mes (luego pide recarga)</span></span>
                                        </li> */}
                                {/* <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                            <Shield className="h-5 w-5 shrink-0" />
                                            <span>Recibos con "⚡ Powered by NeniChat"</span>
                                        </li> */}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline">Pronto</Button>
                        </CardFooter>
                    </Card>

                    {/* Nivel 2: Recargas */}
                    <Card className="flex flex-col border-0 shadow-lg scale-105 z-10 relative overflow-hidden bg-background">
                        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                        <div className="absolute -right-12 top-6 bg-primary text-primary-foreground text-xs font-bold px-12 py-1 rotate-45">
                            POPULAR
                        </div>
                        <CardHeader>
                            <div className="mb-2 text-primary font-bold tracking-wide uppercase text-sm">Nivel 2</div>
                            <CardTitle className="text-3xl font-bold">Recargas</CardTitle>
                            <CardDescription className="text-lg mt-2">Concentrate en crear, no en administrar</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-2xl font-bold">Desde $5 USD</span>
                            </div>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Créditos de IA.
                                Pagas solo lo que usas.
                                Sin rentas forzosas.
                                Tus creditos nunca caducan.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold">Changarro</span>
                                        <span className="font-bold text-primary">$99 MXN</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">50 créditos</div>
                                </div>
                                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer ring-1 ring-primary/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold flex items-center gap-1">Bazar <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /></span>
                                        <span className="font-bold text-primary">$249 MXN</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">150 créditos + 25 créditos gratis</div>
                                </div>
                                <div className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold">Patrona</span>
                                        <span className="font-bold text-primary">$499 MXN</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">400 créditos + 100 créditos gratis</div>
                                </div>
                            </div>

                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>1 Crédito = 1 Conversación Efectiva (Venta)</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>0.3 Créditos = Conversación No Efectiva</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>Tus creditos nunca caducan.</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg">Pronto</Button>
                        </CardFooter>
                    </Card>

                    {/* Nivel 3: Empresaria */}
                    <Card className="flex flex-col border-muted hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                        <CardHeader>
                            <div className="mb-2 text-primary font-bold tracking-wide uppercase text-sm">Nivel 3</div>
                            <CardTitle className="text-3xl font-bold">Empresaria</CardTitle>
                            <CardDescription className="text-lg mt-2">The Infinity Tier</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-5xl font-extrabold">$999</span>
                                <span className="text-muted-foreground"> mxn / mes</span>
                            </div>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Para la PYME con empleados. Barra libre de automatización.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm">
                                    <Crown className="h-5 w-5 text-yellow-500 shrink-0" />
                                    <span><strong>Conversaciones "Ilimitadas"</strong><br /><span className="text-xs text-muted-foreground">Política de uso justo (2,000 chats)</span></span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <Users className="h-5 w-5 text-blue-500 shrink-0" />
                                    <span><strong>Multi-Agente (Team Inbox)</strong><br /><span className="text-xs text-muted-foreground">Varios usuarios en la misma línea</span></span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <BarChart className="h-5 w-5 text-purple-500 shrink-0" />
                                    <span>Exportación de Data (Excel/CSV)</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <MessageSquare className="h-5 w-5 text-pink-500 shrink-0" />
                                    <span>Broadcasts / Difusión Masiva</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline">Pronto</Button>
                        </CardFooter>
                    </Card>

                </div>
            </div>
        </section>
    )
}