"use client";

import { motion } from "motion/react";
import { MessageSquareOff, UserPlus, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * EmptyChats component displays a premium empty state when no contacts are found.
 * 
 * @returns {JSX.Element} The rendered empty state view.
 */
export function EmptyChats() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] h-full w-full p-6 text-center relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center max-w-lg relative z-10"
            >
                <div className="relative mb-10">
                    {/* Main Icon with animated background */}
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, 0, -5, 0],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-28 h-28 bg-linear-to-br from-primary/20 via-primary/10 to-background border border-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/5"
                    >
                        <MessageSquareOff size={56} strokeWidth={1.5} />
                    </motion.div>

                    {/* Floating badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="absolute -right-4 -top-4 w-12 h-12 bg-background border border-border rounded-2xl flex items-center justify-center shadow-xl text-primary"
                    >
                        <Sparkles size={24} className="fill-primary/10" />
                    </motion.div>

                    {/* Secondary floating icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="absolute -left-6 bottom-2 w-10 h-10 bg-muted border border-border rounded-xl flex items-center justify-center shadow-lg text-muted-foreground"
                    >
                        <UserPlus size={18} />
                    </motion.div>
                </div>

                <h3 className="text-3xl font-bold tracking-tight mb-3 text-balance">
                    Sin conexion a WhatsApp.
                </h3>
                <p className="text-muted-foreground mb-10 text-lg leading-relaxed text-balance">
                    Conecta tu cuenta de WhatsApp para empezar a usar Nenichat.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link href="/wapp">
                        <Button variant="outline" size="lg" className="rounded-2xl px-8 h-12 text-base font-semibold border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                            Conectar WhatsApp
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
