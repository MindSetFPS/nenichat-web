import { Building2 } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function WappBusinessMissing() {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
                <h3 className="text-xl font-bold">¡Configuración Pendiente!</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Para poder conectar tu cuenta de WhatsApp, primero necesitas completar la información de tu negocio.
                </p>
            </div>
            <Button asChild className="rounded-2xl">
                <Link href="/home">Configurar Negocio</Link>
            </Button>
        </div>
    )
}