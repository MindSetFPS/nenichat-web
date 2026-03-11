"use client";

import { motion } from "motion/react";
import { MessageSquare, ShoppingBag, ArrowRight, Zap, Users, Check } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "../ui/page-header";
import Content from "@/components/layout/content";


interface WelcomePageProps {
    isWhatsAppConnected?: boolean;
}

export function WelcomePage({ isWhatsAppConnected = false }: WelcomePageProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <Content className="scroll-auto relative overflow-y-auto p-2 flex flex-col">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-pink-500/10 rounded-full blur-[80px]" />
            </div>

            <PageHeader className="" />

            <div className="flex-1 flex flex-col justify-center py-12">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="max-w-4xl w-full mx-auto text-center space-y-12"
                >
                    {/* Header Section */}
                    <motion.div variants={item} className="pb-0 mb-0">
                        {/* <div className="inline-block p-2 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/10 mb-4 backdrop-blur-sm">
                            <Zap className="w-8 h-8 text-primary" />
                        </div> */}
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent pb-2">
                            ¡Gracias por probar Nenichat!
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">Estamos añadiendo funciones nuevas todos los días. Tus comentarios ayudarán a hacer Nenichat más útil para ti.</p>
                    </motion.div>

                    <h2 className="text-2xl mb-4 mt-4 font-bold tracking-tight bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Acciones Recomendadas</h2>

                    {/* Action Cards Grid */}
                    <motion.div
                        variants={item}
                        className="grid grid-cols-1 md:grid-cols-3 gap-2 text-left"
                    >

                        {/* Connect WhatsApp Card */}
                        {isWhatsAppConnected ? (
                            <div className="h-full p-6 rounded-2xl bg-green-500/10 border border-green-500/20 dark:bg-green-900/10 dark:border-green-900/20 shadow-sm backdrop-blur-sm relative overflow-hidden">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-400">WhatsApp Conectado</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ya puedes recibir mensajes de tus clientes.
                                </p>
                            </div>
                        ) : (
                            <Link href="/wapp" className="group">
                                <div className="h-full p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-gray-200/50 dark:border-zinc-800/50 hover:border-primary/20 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowRight className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Enlazar WhatsApp</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Enlaza tu cuenta de WhatsApp para empezar a recibir mensajes directamente aquí.
                                    </p>
                                </div>
                            </Link>
                        )}

                        {/* Create Order Card */}
                        <Link href="/orders/new" className="group">
                            <div className="h-full p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-gray-200/50 dark:border-zinc-800/50 hover:border-primary/20 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ArrowRight className="w-5 h-5 text-primary" />
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Crear primer pedido</h3>
                                <p className="text-sm text-muted-foreground">
                                    Empieza a gestionar tus ventas creando un nuevo pedido manualmente o desde un chat.
                                </p>
                            </div>
                        </Link>

                        {/* Add Contact Card */}
                        <Link href="/contacts/new" className="group">
                            <div className="h-full p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-gray-200/50 dark:border-zinc-800/50 hover:border-primary/20 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ArrowRight className="w-5 h-5 text-primary" />
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Registra un gasto</h3>
                                <p className="text-sm text-muted-foreground">
                                    Registra tus gastos para tener un mejor control de las finanzas de tu negocio.
                                </p>
                            </div>
                        </Link>


                        {/* nenichat social media links (fb, insta, tiktok) */}

                    </motion.div>

                    {/* Tip Section */}
                    <motion.div variants={item} className="opacity-100">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground border border-border/50 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Usa la barra de la izquierda para navegar entre las distintas secciones.</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </Content>
    );
}
