"use client"

import { CheckCircle2, Loader2 } from "lucide-react";
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
        getMyContactAction().then(contact => {
            if (contact) {
                setPhoneNumber(contact.phone_number);
                setIsUser(contact.is_user);
            }
        });
    }, []);

    async function fetchDeviceAndSave() {
        setLoading(true);
        try {
            const data = await getWappDevices(businessId) as WappDevicesResponse;
            if (data?.devices?.[0]?.device) {
                const phone = data.devices[0].device.split(':')[0];
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
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                    <p className="font-semibold">WhatsApp conectado</p>
                    <p className="text-sm text-muted-foreground">Tu instancia está activa.</p>
                </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado</span>
                    <span className="font-medium text-green-600">Activo</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Número</span>
                    <span className="font-mono text-xs">{phoneNumber || '—'}</span>
                </div>
                {isUser && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo</span>
                        <span className="font-medium text-green-600">Usuario</span>
                    </div>
                )}
            </div>

            {!phoneNumber && (
                <Button onClick={fetchDeviceAndSave} disabled={loading} variant="outline" size="sm">
                    {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    {loading ? 'Buscando...' : 'Obtener número'}
                </Button>
            )}

            <CheckWappConnectionButton container={container} />
        </div>
    )
}
