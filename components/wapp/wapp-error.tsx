"use client"

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WappError() {
    return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
                <p className="font-semibold">Error de conexión</p>
                <p className="text-sm text-muted-foreground mt-1">Hay un problema con tu instancia de WhatsApp.</p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => { window.location.search = '?reconnect=true'; }}>
                Reiniciar configuración
            </Button>
        </div>
    )
}
