import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

export default function Hero() {
    return (
        < section className="text-center space-y-4" >
            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-green-500/10 text-green-600 dark:text-green-500 mb-2 relative">
                <MessageCircle className="h-8 w-8" />
                <motion.div
                    className="absolute inset-0 rounded-3xl bg-green-500/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
                WhatsApp
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Automatiza tus ventas y atención al cliente conectando Nenichat con la plataforma de mensajería más usada del mundo.
            </p>
        </section >
    )
}