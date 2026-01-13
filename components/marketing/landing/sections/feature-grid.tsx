"use client";

import { motion } from "motion/react";
import { Bot, CreditCard, Database, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { ShineBorder } from "@/components/ui/shine-border";

export default function FeatureGrid() {
    return (
        <section id="features" className="py-24 overflow-hidden bg-muted/30 relative">

            {/* Background Effects */}
            <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

            <div className="relative container px-4 md:px-6 mx-auto">

                <FlickeringGrid
                    id="flickering-grid"
                    className="absolute mx-auto inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
                    squareSize={4}
                    gridGap={16}
                    color="#60A5FA"
                    maxOpacity={0.5}
                    flickerChance={0.1}
                    height={800}
                    width={900}
                />

                <div className="text-center mb-4 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Agosto 2026
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6 bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
                            Vende hasta cuando no estas.
                        </h2>
                        <p className="text-muted-foreground text-xl my-4">
                            Neni Flow automatiza tus ventas totalmente.
                            Gestiona conversaciones, conoce tu inventario y procesa ventas automáticamente para que tú tengas libertad de crear productos inigualables (o tener más tiempo para ti).
                        </p>
                        <span className="text-muted-foreground text-md mt-8">Disponible en Agosto 2026</span>
                    </motion.div>
                </div>

                {/* Revised Layout Implementation */}
                <div className="relative max-w-4xl mx-auto mt-8 h-[600px] hidden md:block">

                    {/* Connecting Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-20" style={{ overflow: 'visible' }}>
                        <line x1="50%" y1="50%" x2="25%" y2="20%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                        <line x1="50%" y1="50%" x2="75%" y2="20%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                        <line x1="50%" y1="50%" x2="25%" y2="80%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                        <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                    </svg>

                    {/* Central Agent */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <AgentCore />
                    </div>

                    {/* Orbiting Features */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-8 z-20 absolute inset-0 w-full h-full ">
                        <FeatureCard
                            icon={<MessageCircle />}
                            title="Gestión de Chats"
                            desc="Manejo inteligente de contexto y respuestas naturales."
                            align="right"
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<CreditCard />}
                            title="Auto-Ventas"
                            desc="Detecta intención de compra y genera links de pago."
                            align="left"
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={<Database />}
                            title="Inventario Real"
                            desc="Consulta disponibilidad al instante sin salir del chat."
                            align="right"
                            delay={0.6}
                        />
                        <FeatureCard
                            icon={<Sparkles />}
                            title="Aprendizaje"
                            desc="Mejora sus respuestas con cada interacción."
                            align="left"
                            delay={0.8}
                        />
                    </div>

                </div>

                {/* Mobile Layout (Vertical Stack) */}
                <div className="md:hidden flex flex-col items-center gap-12 mt-8">
                    <AgentCore />
                    <div className="grid gap-8 w-full max-w-sm">
                        <FeatureCardMobile icon={<MessageCircle />} title="Gestión de Chats" desc="Manejo inteligente de contexto." />
                        <FeatureCardMobile icon={<CreditCard />} title="Auto-Ventas" desc="Detecta intención de compra." />
                        <FeatureCardMobile icon={<Database />} title="Inventario Real" desc="Consulta disponibilidad al instante." />
                    </div>
                </div>

            </div>
        </section>
    );
}

function AgentCore() {
    return (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <motion.div
                animate={{ scale: [1.4, 1.9, 1.4], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full blur-2xl"
                style={{
                    background: 'linear-gradient(to right, #8b5cf6, #ec4899, #ef4444)', // Example gradient colors (purple, pink, red)
                }}
            />
            <div className="relative z-10 w-24 h-24 rounded-2xl bg-background/80 backdrop-blur-xl border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
                <Bot className="w-10 h-10 text-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, desc, align = "left", delay }: { icon: React.ReactNode, title: string, desc: string, align?: "left" | "right", delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: align === "left" ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className={cn(
                "relative group flex flex-col justify-center justify-self-center items-center self-center p-4 rounded-3xl bg-background border border-primary/20",
                align === "right" ? "items-end text-right" : "items-start text-left"
            )}
        >
            <ShineBorder className="absolute inset-0" shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />

            <div className="p-3 rounded-xl bg-primary/10 text-primary mb-3 w-fit">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">{desc}</p>
        </motion.div>
    )
}



function FeatureCardMobile({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/40 border border-white/5">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
        </div>
    )
}