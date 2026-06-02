import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/ui/shine-border";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PricingFeatureItem } from "@/components/marketing/pricing-feature-item";

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
                        Usa nuestras herramientas de administración gratis siempre, y automatiza tus ventas con Neni Flow.                    </p>
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
                                <PricingFeatureItem>
                                    Catálogo Digital <strong>ilimitado</strong>
                                </PricingFeatureItem>
                                <PricingFeatureItem>
                                    Crea pedidos manualmente
                                </PricingFeatureItem>
                                <PricingFeatureItem>
                                    Estadísticas de tus productos y ventas
                                </PricingFeatureItem>
                                <PricingFeatureItem>
                                    Calcula tu rentabilidad
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Link en Bio
                                </PricingFeatureItem>
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
                            <div className="mb-6">
                                <span className="text-5xl font-extrabold">$599</span>
                                <span className="text-muted-foreground"> mxn / mes</span>
                            </div>
                            <ul className="space-y-3">
                                <PricingFeatureItem>
                                    Conversaciones y mensajes ilimitados
                                </PricingFeatureItem>
                                <PricingFeatureItem>
                                    Pedidos en 1 click con Analisis de chat
                                </PricingFeatureItem>
                                <PricingFeatureItem>
                                    Soporte prioritario
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Campañas de marketing
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Validación de Transferencias (OCR)
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Links de pago
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Delivery
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Envíos nacionales
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Automatiza tus pedidos
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Exporta tus datos a excel
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Análisis de chats
                                </PricingFeatureItem>
                                <PricingFeatureItem status="soon">
                                    Seguimiento de metas
                                </PricingFeatureItem>
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
                                <PricingFeatureItem icon={Crown} iconClassName="text-yellow-500">
                                    <strong>Pedidos Ilimitados</strong>
                                    <br />
                                    <span className="text-muted-foreground text-xs">Automatiza todas tus ventas sin límites.</span>
                                </PricingFeatureItem>
                                <PricingFeatureItem icon={Users} iconClassName="text-indigo-500">
                                    <strong>Hasta 5 usuarios</strong>
                                    <br />
                                    <span className="text-muted-foreground text-xs">Invita hasta 4 personas y controla sus roles y permisos.</span>
                                </PricingFeatureItem>
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