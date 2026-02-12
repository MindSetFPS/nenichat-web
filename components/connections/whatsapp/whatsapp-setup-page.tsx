"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Loader2, MessageCircle, QrCode, Shield, Zap, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import QrCodeSetupInstructions from "./qr-code-setup-instructions"
import Hero from "./hero"

interface WhatsAppSetupPageProps {
    businessId: string;
    initialStep?: number;
    initialQrCode?: string | null;
    initialQrCodeUpdatedAt?: string | null;
}

/**
 * Component for setting up the WhatsApp connection.
 * 
 * @param {WhatsAppSetupPageProps} props - The component props.
 * @returns {JSX.Element} The WhatsApp setup page.
 */
export default function WhatsAppSetupPage({ businessId, initialStep = 1, initialQrCode = null, initialQrCodeUpdatedAt = null }: WhatsAppSetupPageProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(initialStep)
    const [qrCode, setQrCode] = useState<string | null>(initialQrCode)
    const [qrCodeUpdatedAt, setQrCodeUpdatedAt] = useState<string | null>(initialQrCodeUpdatedAt)
    const [isQrExpired, setIsQrExpired] = useState(false)

    useEffect(() => {
        if (step !== 2) return

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'whatsapp-containers',
                    filter: `business_id=eq.${businessId}`,
                },
                (payload) => {
                    if (payload.new) {
                        if (payload.new.qr_code_url) {
                            setQrCode(payload.new.qr_code_url)
                        }
                        // Update the timestamp whenever we get an update
                        const newUpdatedAt = payload.new.qr_code_updated_at
                        if (newUpdatedAt) {
                            setQrCodeUpdatedAt(newUpdatedAt)
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [step, businessId])

    // Check for QR code expiration every second
    useEffect(() => {
        if (!qrCodeUpdatedAt) {
            setIsQrExpired(false)
            return
        }

        const checkExpiration = () => {
            // Ensure the timestamp is treated as UTC by appending 'Z' if not present
            let timestampStr = qrCodeUpdatedAt
            if (!timestampStr.endsWith('Z') && !timestampStr.includes('+') && !timestampStr.includes('T')) {
                // If it's just a date without time, add time
                timestampStr = timestampStr + 'T00:00:00Z'
            } else if (!timestampStr.endsWith('Z') && !timestampStr.includes('+')) {
                // If it has time but no timezone, add UTC indicator
                timestampStr = timestampStr + 'Z'
            }

            const updatedAt = new Date(timestampStr).getTime()
            const now = new Date().getTime()
            // Check if it's been more than 30 seconds (30000ms)
            const diff = now - updatedAt
            const expired = diff > 30000
            setIsQrExpired(expired)
        }

        // Check immediately
        checkExpiration()

        // Set up interval to check every second
        const intervalId = setInterval(checkExpiration, 5000)

        return () => clearInterval(intervalId)
    }, [qrCodeUpdatedAt])

    async function handleRegenerateQRCode() {
        setIsLoading(true)
        try {
            const response = await fetch('/api/infra/regenerate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    business_id: businessId,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al regenerar el QR');
            }

            const data = await response.json();

            console.log(data)

        } catch (error) {
            console.error('Error regenerating QR:', error);
            toast.error("No se pudo regenerar el QR", {
                description: "Por favor, inténtalo de nuevo más tarde.",
                icon: <AlertCircle className="h-4 w-4 text-destructive" />
            });
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateWAPPConnection() {
        setIsLoading(true)
        try {
            const response = await fetch('/api/infra/containers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    business_id: businessId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al crear la conexión');
            }

            const data = await response.json();

            setStep(2)
        } catch (error) {
            console.error('Error creating WAPP connection:', error);
            toast.error("No se pudo crear la conexión", {
                description: "Por favor, inténtalo de nuevo más tarde.",
                icon: <AlertCircle className="h-4 w-4 text-destructive" />
            });
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <main className="flex-1 w-full max-w-4xl mx-auto ">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <Hero />
                    {/* Call to Action */}
                    <Card
                        className="relative overflow-hidden border border-border/50 bg-linear-to-br from-card/50 to-muted/30 backdrop-blur-md rounded-4xl p-0">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />

                        <CardContent className="p-0 py-4 lg:p-12 text-center flex flex-col items-center">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="space-y-6 w-full max-w-md px-2"
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold">¿Listo para comenzar?</h2>
                                            <p className="text-muted-foreground">Conecta tu cuenta de WhatsApp a Nenichat.</p>
                                        </div>

                                        <Button
                                            size="lg"
                                            className="w-full rounded-2xl h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            onClick={handleCreateWAPPConnection}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Provisionando instancia...
                                                </>
                                            ) : (
                                                "Vincular cuenta nueva"
                                            )}
                                        </Button>
                                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-3 w-3 text-green-500" /> No requiere tarjeta de crédito
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="w-64 h-64 bg-white p-4 rounded-3xl shadow-inner border-8 border-muted flex items-center justify-center relative overflow-hidden group">
                                            {qrCode ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={qrCode}
                                                    alt="WhatsApp QR Code"
                                                    className={`h-full aspect-square w-full object-contain transition-opacity duration-300 ${isQrExpired ? 'opacity-20 blur-sm' : 'opacity-100'}`}
                                                />
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 bg-linear-to-tr from-muted/50 to-transparent animate-pulse" />
                                                    <QrCode className="h-40 w-40 aspect-square text-muted-foreground/30 relative z-10" />
                                                </>
                                            )}

                                            {/* Reload button - only show when expired */}
                                            <div className={`absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-xs transition-opacity duration-300 ${isQrExpired ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                                <Button
                                                    variant="default"
                                                    size="default"
                                                    className="rounded-2xl shadow-xl relative z-10"
                                                    onClick={handleRegenerateQRCode}
                                                    disabled={isLoading}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <RefreshCcw className="h-4 w-4" />
                                                        )}
                                                        <span>Recargar código QR</span>
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                        <QrCodeSetupInstructions />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    )
}