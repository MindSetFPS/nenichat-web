"use client"

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWappDevices } from "./get-wapp-devices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function CheckWappConnectionButton({ container }: { container: any }) {
    const [loading, setLoading] = useState(false);
    const supabase = createBrowserSupabaseClient();

    async function handleCheckWappAuth() {
        try {
            setLoading(true);
            const data = await getWappDevices(container.business_id) as { success?: boolean; devices?: Array<{ name: string; device: string }> };

            console.log(data)
            if (data.success && data.devices && data.devices.length > 0) {
                // If there are devices connected, just reload to reflect any new status, or maybe do nothing.
                window.location.reload();
            } else {
                // Devices empty means not connected, set status to deployed to show QR
                console.log("setting deployed bc no devices")
                const { error } = await supabase
                    .from('whatsapp-containers')
                    .update({ status: 'deployed', qr_code_url: null })
                    .eq('business_id', container.business_id);
                if (error) console.error(error)
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
            // Error means probably not connected or container broken, set generic deployed state
            console.log(container.business_id)
            const { error } = await supabase
                .from('whatsapp-containers')
                .update({ status: 'deployed', qr_code_url: null })
                .eq('business_id', container.business_id);
            if (error) console.error(error)
            window.location.reload();
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            variant="outline"
            className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-900/20"
            onClick={handleCheckWappAuth}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Verificando...' : 'Verificar estado de conexión'}
        </Button>
    )
}
