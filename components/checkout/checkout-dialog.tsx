'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, CreditCard, Loader2 } from "lucide-react"

export interface CheckoutItem {
    id: string
    title: string
    price: number
    description: string
    features?: string[]
}

interface CheckoutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: CheckoutItem | null
    onSuccess?: () => void
}

export function CheckoutDialog({ open, onOpenChange, item, onSuccess }: CheckoutDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Reset state when dialog opens/closes or item changes
    // simplified for this mock
    if (!open && (isLoading || isSuccess)) {
        setTimeout(() => {
            setIsLoading(false)
            setIsSuccess(false)
        }, 300)
    }

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        setIsLoading(false)
        setIsSuccess(true)

        // Close after success
        setTimeout(() => {
            onOpenChange(false)
            if (onSuccess) onSuccess()
        }, 2000)
    }

    if (!item) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-center">¡Pago Exitoso!</h2>
                        <p className="text-center text-muted-foreground">
                            Has adquirido <strong>{item.title}</strong> correctamente.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Finalizar Compra</DialogTitle>
                            <DialogDescription>
                                Estás a punto de adquirir {item.title}. Ingresa tus datos de pago.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="bg-muted/30 p-4 rounded-lg border mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{item.title}</span>
                                <span className="font-bold">${item.price} MXN</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>

                        <form onSubmit={handlePay} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre en la tarjeta</Label>
                                <Input id="name" placeholder="Daniel ..." required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="number">Número de tarjeta</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="number" className="pl-9" placeholder="0000 0000 0000 0000" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiración</Label>
                                    <Input id="expiry" placeholder="MM/YY" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="123" required />
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        `Pagar $${item.price} MXN`
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
