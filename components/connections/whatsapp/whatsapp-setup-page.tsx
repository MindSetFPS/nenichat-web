"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Loader2, MessageCircle, QrCode, Shield, Zap, CheckCircle2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface WhatsAppSetupPageProps {
    businessId: string;
}

/**
 * Component for setting up the WhatsApp connection.
 * 
 * @param {WhatsAppSetupPageProps} props - The component props.
 * @returns {JSX.Element} The WhatsApp setup page.
 */
export default function WhatsAppSetupPage({ businessId }: WhatsAppSetupPageProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)

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
            console.log('Connection created:', data);

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

    const steps = [
        {
            icon: Zap,
            title: "Instancia rápida",
            description: "Creamos un contenedor dedicado para tu conexión segura."
        },
        {
            icon: QrCode,
            title: "Vinculación QR",
            description: "Escanea el código desde tu app de WhatsApp."
        },
        {
            icon: Shield,
            title: "Conexión Encriptada",
            description: "Tus mensajes viajan seguros con cifrado de punto a punto."
        }
    ]

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Conexiones" />

            <main className="flex-1 w-full max-w-4xl mx-auto ">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    {/* Hero Section */}
                    <section className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-green-500/10 text-green-600 dark:text-green-500 mb-2 relative">
                            <MessageCircle className="h-12 w-12" />
                            <motion.div
                                className="absolute inset-0 rounded-3xl bg-green-500/20"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                            WhatsApp
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Automatiza tus ventas y atención al cliente conectando Nenichat con la plataforma de mensajería más usada del mundo.
                        </p>
                    </section>

                    {/* Steps / Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {steps.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                            >
                                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-xs hover:bg-card/80 transition-colors">
                                    <CardContent className="pt-6 text-center space-y-3">
                                        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                            <s.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-bold text-lg">{s.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {s.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <Card className="relative overflow-hidden border border-border/50 bg-linear-to-br from-card/50 to-muted/30 backdrop-blur-md rounded-4xl">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />

                        <CardContent className="p-8 md:p-12 text-center space-y-8 flex flex-col items-center">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="space-y-6 w-full max-w-md"
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold">¿Listo para comenzar?</h2>
                                            <p className="text-muted-foreground">
                                                Configuraremos una instancia limpia para tu cuenta. Este proceso toma menos de un minuto.
                                            </p>
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
                                        className="space-y-6 flex flex-col items-center"
                                    >
                                        <div className="w-64 h-64 bg-white p-4 rounded-3xl shadow-inner border-8 border-muted flex items-center justify-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-linear-to-tr from-muted/50 to-transparent animate-pulse" />
                                            <QrCode className="h-40 w-40 text-muted-foreground/30 relative z-10" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="secondary" size="sm" className="rounded-full">
                                                    Recargar QR
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 max-w-sm">
                                            <h2 className="text-2xl font-bold">Escanea el código QR</h2>
                                            <ol className="text-sm text-muted-foreground text-left space-y-2 mt-4">
                                                <li className="flex gap-3">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">1</span>
                                                    Abre WhatsApp en tu teléfono
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">2</span>
                                                    Toca Menú o Configuración y selecciona Dispositivos vinculados
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">3</span>
                                                    Apunta tu teléfono a esta pantalla para escanear el código
                                                </li>
                                            </ol>
                                        </div>
                                        <Button variant="ghost" onClick={() => setStep(1)}>
                                            Cancelar y volver
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Footer Info */}
                    <p className="text-center text-sm text-muted-foreground pb-12">
                        ¿Tienes dudas sobre la conexión? <a href="#" className="underline hover:text-primary">Lee nuestra guía de seguridad</a>.
                    </p>
                </motion.div>
            </main>
        </div>
    )
}