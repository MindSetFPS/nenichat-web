"use client";

import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, User, Users } from "lucide-react";
import { IChat } from "@/Nenichat/Chats/domain/IChat";
import Link from "next/link";

export function RecentConversations({ chats }: { chats: IChat[] }) {
    // Sort by last_message_time descending and take top 5
    const recentChats = [...chats]
        .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime())
        .slice(0, 5);

    if (recentChats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No hay conversaciones recientes.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {recentChats.map((chat, i) => (
                <motion.div
                    key={chat.jid}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <Link
                        href={`/chats/${chat.jid}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all group"
                    >
                        <div className="relative group-hover:scale-110 transition-transform">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-muted-foreground group-hover:text-primary transition-colors">
                                {chat.is_group ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            </div>
                            {/* Subtle blue dot for "recent" activity */}
                            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                    {chat.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground shrink-0">
                                    {formatDistanceToNow(new Date(chat.last_message_time), { addSuffix: false, locale: es })}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate opacity-70">
                                Responde a tu cliente ahora
                            </p>
                        </div>
                    </Link>
                </motion.div>
            ))}
            <Link
                href="/chats"
                className="block w-full py-2 mt-2 text-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-4"
            >
                Ver todos los chats
            </Link>
        </div>
    );
}
