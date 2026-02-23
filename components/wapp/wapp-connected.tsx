"use client"

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CheckWappConnectionButton from "../connections/whatsapp/check-wapp-connection-button";

export default function WappConnected({ container }: { container: any }) {
    return (
        <div className="space-y-4 mx-4">
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800 rounded-3xl">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                    </div>
                    <CardTitle className="text-xl font-bold text-green-700 dark:text-green-400">WhatsApp Conectado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                    <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50 space-y-2">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground">Estado</span>
                            <span className="font-bold text-green-600">Activo</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground">Número</span>
                            <span className="font-mono text-xs">{container?.container_id || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <CheckWappConnectionButton container={container} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}