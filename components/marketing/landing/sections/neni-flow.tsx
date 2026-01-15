"use client";

import { motion } from "motion/react";
import { Bot, Crown, MessageCircle, Package, Sparkles, User, Zap, Check, Clock, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShineBorder } from "@/components/ui/shine-border";

/**
 * Neni Flow section component for the landing page.
 * Showcases the premium automation features and differentiates from the free Nenichat tier.
 */
export default function NeniFlow() {
    return (
        <section id="neniflow" className="py-32 overflow-hidden bg-linear-to-b from-background via-muted/30 to-background relative">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="container px-4 md:px-6 mx-auto">
                {/* Header */}
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Badges */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Badge className="bg-linear-to-r from-purple-500 to-cyan-400 text-white border-0 px-3 py-1">
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                            </Badge>
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1">
                                <Clock className="w-3 h-3 mr-1" />
                                Próximamente · Agosto 2026
                            </Badge>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            Tu negocio vendiendo{" "}
                            <span className="bg-linear-to-r from-purple-500 via-cyan-400 to-orange-400 bg-clip-text text-transparent">
                                24/7, sin ti
                            </span>
                        </h2>

                        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                            Con <strong className="text-foreground">Nenichat</strong> organizas tus ventas manualmente.
                            Con <strong className="text-foreground">Neni Flow</strong>, la AI hace todo por ti:
                            desde responder hasta cobrar.
                        </p>
                    </motion.div>
                </div>

                {/* Comparison Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-20">
                    {/* Nenichat - Manual */}
                    <ComparisonCard
                        title="Con Nenichat"
                        subtitle="Gratis · Tú contestas"
                        icon={<User className="w-5 h-5" />}
                        variant="default"
                        delay={0.1}
                        items={[
                            "Recibes el mensaje",
                            "Tú respondes manualmente",
                            "Creas el pedido a mano",
                            "Envías datos de pago",
                            "Confirmas cuando paguen",
                        ]}
                    />

                    {/* Neni Flow - Automatic */}
                    <ComparisonCard
                        title="Con Neni Flow"
                        subtitle="Premium · AI contesta"
                        icon={<Bot className="w-5 h-5" />}
                        variant="premium"
                        delay={0.3}
                        items={[
                            "Cliente escribe a cualquier hora",
                            "AI responde al instante",
                            "Detecta intención de compra",
                            "Genera link de pago automático",
                            "Confirma el pedido sin ti",
                        ]}
                    />
                </div>

                {/* Automation Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h3 className="text-center text-2xl font-bold mb-10">
                        El flujo completo, <span className="text-primary">automatizado</span>
                    </h3>

                    <div className="relative">
                        {/* Connecting line for desktop - centered on icons */}
                        <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 z-0 overflow-hidden rounded-full">
                            {/* Base line */}
                            <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 via-cyan-400/20 to-orange-400/20" />
                            {/* Animated beam */}
                            <motion.div
                                className="absolute inset-y-0 w-1/4 bg-linear-to-r from-transparent via-white/60 to-transparent"
                                animate={{ x: ["-100%", "500%"] }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    repeatDelay: 0.5,
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                            <TimelineStep
                                step={1}
                                icon={<MessageCircle className="w-5 h-5" />}
                                title="Cliente escribe"
                                description="A cualquier hora del día"
                                delay={0.1}
                            />
                            <TimelineStep
                                step={2}
                                icon={<Bot className="w-5 h-5" />}
                                title="AI responde"
                                description="Conoce tu catálogo y precios"
                                delay={0.2}
                            />
                            <TimelineStep
                                step={3}
                                icon={<CreditCard className="w-5 h-5" />}
                                title="Link de pago"
                                description="Genera el cobro automáticamente"
                                delay={0.3}
                            />
                            <TimelineStep
                                step={4}
                                icon={<Package className="w-5 h-5" />}
                                title="Pedido listo"
                                description="Solo queda entregar"
                                delay={0.4}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Bottom CTA hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-8"
                >
                    <p className="text-muted-foreground text-sm">
                        <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
                        Disponible en <strong>Agosto 2026</strong>. Aparta tu lugar hoy y obtén créditos gratis.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

/**
 * Comparison card component for showing Nenichat vs Neni Flow differences.
 */
interface ComparisonCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    items: string[];
    variant: "default" | "premium";
    delay: number;
}

function ComparisonCard({ title, subtitle, icon, items, variant, delay }: ComparisonCardProps) {
    const isPremium = variant === "premium";

    return (
        <motion.div
            initial={{ opacity: 0, x: isPremium ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "relative p-6 md:p-8 rounded-3xl border",
                isPremium
                    ? "bg-linear-to-br from-purple-500/5 via-cyan-400/5 to-orange-500/5 border-purple-500/20"
                    : "bg-muted/30 border-border"
            )}
        >
            {isPremium && (
                <ShineBorder
                    className="absolute inset-0 rounded-3xl"
                    shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                />
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className={cn(
                        "p-2.5 rounded-xl",
                        isPremium
                            ? "bg-linear-to-br from-purple-500 to-cyan-400 text-white"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{title}</h3>
                        <p className={cn(
                            "text-sm",
                            isPremium ? "text-purple-400" : "text-muted-foreground"
                        )}>
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Items */}
                <ul className="space-y-3">
                    {items.map((item, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: delay + index * 0.1 }}
                            className="flex items-start gap-3"
                        >
                            <div className={cn(
                                "mt-0.5 shrink-0",
                                isPremium ? "text-green-400" : "text-muted-foreground"
                            )}>
                                {isPremium ? (
                                    <Zap className="w-4 h-4" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                            </div>
                            <span className={cn(
                                "text-sm",
                                isPremium ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {item}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

/**
 * Timeline step component for showing the automation flow.
 */
interface TimelineStepProps {
    step: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
}

function TimelineStep({ step, icon, title, description, delay }: TimelineStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay }}
            className="relative flex flex-col items-center text-center"
        >
            {/* Step circle */}
            <div className="relative mb-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    {icon}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                    {step}
                </div>
            </div>

            <h4 className="font-bold mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </motion.div>
    );
}