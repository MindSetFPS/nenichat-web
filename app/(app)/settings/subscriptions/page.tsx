'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { Check, Crown, MessageSquare, Star, Users, Zap } from "lucide-react"
import { ShineBorder } from "@/components/ui/shine-border"
import { CheckoutDialog, CheckoutItem } from "@/components/checkout/checkout-dialog"
import { useState } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

interface Purchase {
    id: string
    date: string
    item: string
    amount: number
    status: string
}

export default function SubscriptionPage() {
    // Mock user status
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
            // Update mock state based on purchase
            if (selectedItem.id === "premium-monthly") {
                setUserPlan("Premium")
            } else {
                // Extract credit amount from title/logic (simplified for mock)
                const creditMap: Record<string, number> = {
                    "changarro": 50,
                    "bazar": 175,
                    "patrona": 500
                }
                const addedCredits = creditMap[selectedItem.id] || 0
                setUserCredits(prev => prev + addedCredits)
            }

            // Add to history
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
        <>
            <PageHeader title="Suscripción y Créditos" />
            <main className="flex-1 overflow-y-auto p-4 space-y-8">
                {/* Status Section */}
                <section>
                    <h2 className="text-lg font-semibold mb-4">Estado Actual</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Tu Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{userPlan}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {userPlan === "Starter" ? "Plan gratuito con funcionalidades básicas." : "Plan Premium con acceso ilimitado."}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Créditos Neni Flow</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{userCredits}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Disponibles para usar en automatizaciones.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Credits Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold">Recarga Créditos Neni Flow</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                        Un crédito se consume cuando se realiza una venta efectiva (conversación exitosa).
                        Compre más según lo necesite.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Changarro */}
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl">Changarro</CardTitle>
                                <CardDescription>Para empezar</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-4">
                                    <span className="text-3xl font-bold">$99</span>
                                    <span className="text-muted-foreground text-sm"> MXN</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">50 créditos</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground pl-6">
                                        $1.98 por venta
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline" onClick={() => handleBuy({ id: "changarro", title: "Paquete Changarro", price: 99, description: "50 créditos Neni Flow" })}>Comprar 50</Button>
                            </CardFooter>
                        </Card>

                        {/* Bazar (Best Value) */}
                        <Card className="flex flex-col relative border-primary/50 overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                POPULAR
                            </div>
                            <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-xl">Bazar</CardTitle>
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                </div>
                                <CardDescription>El favorito</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-4">
                                    <span className="text-3xl font-bold">$249</span>
                                    <span className="text-muted-foreground text-sm"> MXN</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">175 créditos</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground pl-6">
                                        $1.42 por venta
                                    </p>
                                    <Badge variant="secondary" className="mt-2 text-xs">
                                        Ahorras 28%
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleBuy({ id: "bazar", title: "Paquete Bazar", price: 249, description: "175 créditos Neni Flow" })}>Comprar 175</Button>
                            </CardFooter>
                        </Card>

                        {/* Patrona */}
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl">Patrona</CardTitle>
                                <CardDescription>Alto volumen</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="mb-4">
                                    <span className="text-3xl font-bold">$499</span>
                                    <span className="text-muted-foreground text-sm"> MXN</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">500 créditos</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground pl-6">
                                        $0.99 por venta
                                    </p>
                                    <Badge variant="secondary" className="mt-2 text-xs">
                                        Ahorras 50%
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline" onClick={() => handleBuy({ id: "patrona", title: "Paquete Patrona", price: 499, description: "500 créditos Neni Flow" })}>Comprar 500</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                {/* Premium Subscription Section */}
                <section className="pb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold">Neni Chat Premium</h2>
                    </div>

                    <Card className="bg-gradient-to-br from-background to-muted/50 border-primary/20">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                            <div className="lg:col-span-2 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold">Lleva tu negocio al siguiente nivel</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Obtén acceso ilimitado y herramientas de colaboración para todo tu equipo.
                                    </p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Conversaciones Ilimitadas</p>
                                            <p className="text-xs text-muted-foreground">Sin límites de historial o chats activos.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Equipo de 5 Usuarios</p>
                                            <p className="text-xs text-muted-foreground">Cuentas para tus colaboradores incluidas.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center lg:items-end border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
                                <div className="text-center lg:text-right mb-4">
                                    <span className="text-3xl font-bold">$2,499</span>
                                    <span className="text-muted-foreground"> mxn/mes</span>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                                    onClick={() => handleBuy({ id: "premium-monthly", title: "Suscripción Premium", price: 2499, description: "Neni Chat Premium - Mensual" })}
                                >
                                    Suscribirse Ahora
                                </Button>
                                <p className="text-xs text-muted-foreground mt-3 text-center lg:text-right">
                                    Cancela en cualquier momento.
                                </p>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Purchase History Section */}
                <section className="pb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Historial de Compras</h2>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No hay compras recientes.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                purchases.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                        <TableCell>{purchase.date}</TableCell>
                                        <TableCell className="font-medium">{purchase.item}</TableCell>
                                        <TableCell>${purchase.amount} MXN</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {purchase.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </section>
            </main>

            <CheckoutDialog
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                item={selectedItem}
                onSuccess={handleSuccess}
            />
        </>
    )
}
