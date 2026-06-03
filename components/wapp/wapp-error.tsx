"use client"

import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WappError({ reconnect }: { reconnect: boolean }) {
    return (
        <Card className="border-destructive/20 bg-destructive/5 dark:bg-destructive/10 rounded-3xl">
            <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-xl font-bold text-destructive">Error de Conexión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
                <p className="text-sm text-center text-muted-foreground">
                    Hemos detectado un problema con tu instancia de WhatsApp.
                </p>
                <Button asChild className="w-full rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-white">
                    <Link href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); window.location.search = '?reconnect=true'; }}>
                        Reiniciar Configuración
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}