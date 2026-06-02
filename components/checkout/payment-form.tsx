"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, CheckCircle, Lock } from "lucide-react";

interface PaymentFormProps {
    amount: number;
    onSuccess: () => void;
}

export function PaymentForm({ amount, onSuccess }: PaymentFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock payment processing — replace with real payment gateway
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsLoading(false);
        setIsSuccess(true);

        setTimeout(() => {
            onSuccess();
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-center">¡Pago Exitoso!</h2>
                <p className="text-center text-muted-foreground">
                    Tu suscripción se ha activado correctamente.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Datos de pago</h3>

                <div className="space-y-2">
                    <Label htmlFor="cardholder">Titular de la tarjeta</Label>
                    <Input
                        id="cardholder"
                        placeholder="Daniel López"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="card-number">Número de tarjeta</Label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="card-number"
                            className="pl-9"
                            placeholder="0000 0000 0000 0000"
                            required
                            disabled={isLoading}
                            maxLength={19}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="expiry">Vencimiento</Label>
                        <Input
                            id="expiry"
                            placeholder="MM/AA"
                            required
                            disabled={isLoading}
                            maxLength={5}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                            id="cvc"
                            placeholder="123"
                            required
                            disabled={isLoading}
                            maxLength={4}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                    <Lock className="h-3 w-3" />
                    <span>Pago seguro • Tus datos están protegidos</span>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Procesando pago...
                        </>
                    ) : (
                        `Pagar $${amount} MXN`
                    )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    Puedes cancelar tu suscripción en cualquier momento.
                </p>
            </div>
        </form>
    );
}
