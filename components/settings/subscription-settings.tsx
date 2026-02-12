'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, MessageSquare, Star, Users, Zap, History } from "lucide-react"
import { ShineBorder } from "@/components/ui/shine-border"
import { CheckoutDialog, CheckoutItem } from "@/components/checkout/checkout-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Purchase {
    id: string
    date: string
    item: string
    amount: number
    status: string
}

/**
 * @function SubscriptionSettings
 * @description Renders the subscription and credits settings view.
 */
export function SubscriptionSettings() {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null)
    const [userCredits, setUserCredits] = useState(26)
    const [userPlan, setUserPlan] = useState("Starter")
    const [purchases, setPurchases] = useState<Purchase[]>([
        { id: "1", date: "2023-10-15", item: "Paquete Changarro (50 créditos)", amount: 99, status: "Pagado" }
    ])

    const handleBuy = (item: CheckoutItem) => {
        setSelectedItem(item)
        setIsCheckoutOpen(true)
    }

    const handleSuccess = () => {
        if (selectedItem) {
            if (selectedItem.id === "premium-monthly") {
                setUserPlan("Premium")
            } else {
                const creditMap: Record<string, number> = {
                    "changarro": 50,
                    "bazar": 175,
                    "patrona": 500
                }
                const addedCredits = creditMap[selectedItem.id] || 0
                setUserCredits(prev => prev + addedCredits)
            }

            const newPurchase: Purchase = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split('T')[0],
                item: selectedItem.title,
                amount: selectedItem.price,
                status: "Pagado"
            }
            setPurchases(prev => [newPurchase, ...prev])
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Status Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tu Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{userPlan}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {userPlan === "Starter" ? "Plan gratuito básico." : "Plan Premium ilimitado."}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-primary uppercase tracking-wider">Créditos Neni Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-primary">{userCredits}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Disponibles para automatizaciones.
                        </p>
                    </CardContent>
                </Card>
            </section>

            {/* Credits Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-lg font-bold">Recarga Créditos</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Changarro */}
                    <Card className="flex flex-col border-border/50 bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">Changarro</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-3">
                            <div>
                                <span className="text-2xl font-black">$99</span>
                                <span className="text-muted-foreground text-xs font-bold"> MXN</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>50 créditos</span>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => handleBuy({ id: "changarro", title: "Paquete Changarro", price: 99, description: "50 créditos Neni Flow" })}>Comprar</Button>
                        </CardFooter>
                    </Card>

                    {/* Bazar */}
                    <Card className="flex flex-col relative border-primary/50 overflow-hidden bg-card/50 shadow-md">
                        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                Bazar <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-3">
                            <div>
                                <span className="text-2xl font-black">$249</span>
                                <span className="text-muted-foreground text-xs font-bold"> MXN</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>175 créditos</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold px-2">Ahorras 28%</Badge>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button size="sm" className="w-full rounded-xl" onClick={() => handleBuy({ id: "bazar", title: "Paquete Bazar", price: 249, description: "175 créditos Neni Flow" })}>Comprar</Button>
                        </CardFooter>
                    </Card>

                    {/* Patrona */}
                    <Card className="flex flex-col border-border/50 bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">Patrona</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-3">
                            <div>
                                <span className="text-2xl font-black">$499</span>
                                <span className="text-muted-foreground text-xs font-bold"> MXN</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>500 créditos</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold px-2">Ahorras 50%</Badge>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => handleBuy({ id: "patrona", title: "Paquete Patrona", price: 499, description: "500 créditos Neni Flow" })}>Comprar</Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            {/* Premium Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <h2 className="text-lg font-bold">Neni Chat Premium</h2>
                </div>

                <Card className="bg-linear-to-br from-primary/5 to-background border-primary/20 shadow-lg overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 blur-[60px] rounded-full" />
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-xl font-black tracking-tight">LEVEL UP YOUR BUSINESS</h3>
                            <p className="text-sm text-muted-foreground">Acceso ilimitado y equipo incluido.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-background/50 border border-border/50">
                                <MessageSquare className="h-4 w-4 text-primary mt-1" />
                                <div>
                                    <p className="text-sm font-bold">Ilimitado</p>
                                    <p className="text-[10px] text-muted-foreground">Chats sin límites.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-background/50 border border-border/50">
                                <Users className="h-4 w-4 text-primary mt-1" />
                                <div>
                                    <p className="text-sm font-bold">Equipo</p>
                                    <p className="text-[10px] text-muted-foreground">Hasta 5 usuarios.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50 relative z-10">
                            <div>
                                <span className="text-3xl font-black">$2,499</span>
                                <span className="text-muted-foreground text-xs">/mes</span>
                            </div>
                            <Button
                                className="w-full sm:w-auto rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                onClick={() => handleBuy({ id: "premium-monthly", title: "Suscripción Premium", price: 2499, description: "Neni Chat Premium - Mensual" })}
                            >
                                Suscribirse
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* History Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-bold">Historial</h2>
                </div>
                <div className="rounded-2xl border bg-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-xs font-bold">Fecha</TableHead>
                                <TableHead className="text-xs font-bold">Concepto</TableHead>
                                <TableHead className="text-xs font-bold text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchases.map((purchase) => (
                                <TableRow key={purchase.id} className="text-sm">
                                    <TableCell className="text-muted-foreground">{purchase.date}</TableCell>
                                    <TableCell className="font-bold">{purchase.item}</TableCell>
                                    <TableCell className="text-right font-bold">${purchase.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <CheckoutDialog
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                item={selectedItem}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
