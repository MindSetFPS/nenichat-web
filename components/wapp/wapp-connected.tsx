"use client"

import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CheckWappConnectionButton from "../connections/whatsapp/check-wapp-connection-button";
import { getMyContactAction, setContactAsUserAction } from "@/app/(app)/settings/actions";
import { getWappDevices } from "../connections/whatsapp/get-wapp-devices";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface WappDevicesResponse {
    devices?: Array<{
        name: string;
        device: string;
    }>;
}

export default function WappConnected({ container, businessId }: { container: any; businessId: number }) {
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [isUser, setIsUser] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchContact() {
            const contact = await getMyContactAction();
            if (contact) {
                setPhoneNumber(contact.phone_number);
                setIsUser(contact.is_user);
            }
        }

        fetchContact();
    }, []);

    async function fetchDeviceAndSave() {
        setLoading(true);
        try {
            const data = await getWappDevices(businessId) as WappDevicesResponse;
            if (data?.devices?.[0]?.device) {
                const device = data.devices[0].device;
                const phone = device.split(':')[0];
                setPhoneNumber(phone);
                setIsUser(true);
                await setContactAsUserAction(phone);
            }
        } catch (error) {
            console.error('Error fetching device:', error);
        } finally {
            setLoading(false);
        }
    }

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
                            <span className="font-mono text-xs">{phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground">LID</span>
                            <span className="font-mono text-xs">null</span>
                        </div>
                        {isUser && (
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">Tipo</span>
                                <span className="font-bold text-green-600">Usuario</span>
                            </div>
                        )}
                    </div>

                    {!phoneNumber && (
                        <Button 
                            onClick={fetchDeviceAndSave} 
                            disabled={loading}
                            variant="outline"
                            className="w-full"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Buscando...' : 'Obtener número'}
                        </Button>
                    )}

                    <div className="pt-2">
                        <CheckWappConnectionButton container={container} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
