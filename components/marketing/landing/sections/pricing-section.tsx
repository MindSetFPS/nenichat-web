import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Check, Crown, MessageSquare, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/ui/shine-border";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function PricingSection() {
    return (
        <section id="pricing" className="pb-24 bg-muted/50">

            {/* Hero Section */}
            <section className="relative py-8 md:py-16 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

                <div className="container px-4 md:px-6 mx-auto text-center">
                    <Badge className="mb-4" variant="secondary">Planes Flexibles</Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl mb-6 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                        Empieza con $0, <br className="hidden md:block" />
                        <span className="text-primary">y crece con Nenichat.</span>
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mb-12">
                        Usa nuestras herramientas de administración gratis siempre, y automatiza tus ventas con Neni Flow solo cuando tú quieras, con recargas desde $99 pesos.                    </p>
                </div>
            </section>

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
                                Ideal para organizar el caos, dejar la libreta y verte profesional ante tus clientes.<br /> Tú contestas, nosotros organizamos.
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
                                    <span>Crea pedidos manualmente</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>Estadísticas de tus productos y ventas</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>Calcula tu rentabilidad</span>
                                </li>

                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>(Proximamente) Link en Bio</span>
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
                            <Link className="w-full" href="#hero">
                                <Button className="w-full" variant="outline">Apartar mi lugar</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Nivel 2: Recargas */}
                    <Card className="flex flex-col border-0 shadow-lg scale-105 z-10 relative overflow-hidden bg-background">
                        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                        <div className="absolute -right-12 top-6 bg-primary text-primary-foreground text-xs font-bold px-10 py-1 rotate-45">
                            MEJOR VALOR
                        </div>
                        <CardHeader>
                            <div className="mb-2 text-primary font-bold tracking-wide uppercase text-sm">Nivel 2</div>
                            <CardTitle className="text-3xl font-bold">Neni Flow</CardTitle>
                            <CardDescription className="text-lg mt-2">Contestamos, organizamos y vendemos, mientras tú creas productos increíbles.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
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
                                    <span>Tus creditos nunca caducan.</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>(Proximamente) Validación de Transferencias (OCR)</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link className="w-full" href="#hero">
                                <Button className="w-full" size="lg">Apartar mi lugar</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Nivel 3: Empresaria */}
                    <Card className="flex flex-col border-muted hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                        <CardHeader>
                            <div className="mb-2 text-primary font-bold tracking-wide uppercase text-sm">Nivel 3</div>
                            <CardTitle className="text-3xl font-bold">Empresaria</CardTitle>
                            <CardDescription className="text-lg mt-2">Maneja cientos de chats diarios con Neni Flow.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-5xl font-extrabold">$2,499</span>
                                <span className="text-muted-foreground"> mxn / mes</span>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm">
                                    <Crown className="h-5 w-5 text-yellow-500 shrink-0" />
                                    <div className="flex flex-col">
                                        <span><strong>Conversaciones Ilimitadas</strong></span>
                                        <span className="text-muted-foreground text-xs">No vuelvas a preocuparte por tus créditos.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <Users className="h-5 w-5 text-indigo-500 shrink-0" />
                                    <div className="flex flex-col">
                                        <span><strong>Hasta 5 usuarios</strong></span>
                                        <span className="text-muted-foreground text-xs">Invita hasta 4 personas y controla sus roles y permisos.</span>
                                    </div>
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