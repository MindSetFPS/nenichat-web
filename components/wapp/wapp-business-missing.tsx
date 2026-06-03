import { Building2 } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function WappBusinessMissing() {
    return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Building2 className="h-6 w-6 text-muted-foreground" />
            <div>
                <p className="font-semibold">Configura tu negocio</p>
                <p className="text-sm text-muted-foreground mt-1">Para conectar WhatsApp, primero completa la información de tu negocio.</p>
            </div>
            <Button size="sm" asChild>
                <Link href="/home">Ir a configuración</Link>
            </Button>
        </div>
    )
}
