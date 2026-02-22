"use client"

import { Button } from "@/components/ui/button"
import { getWappDevices } from "./get-wapp-devices"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function CheckWappAuthButton({ businessId }: { businessId: string }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleCheckWappAuth() {
        try {
            setLoading(true)
            setError(null)
            const data = await getWappDevices(parseInt(businessId)) as { success?: boolean; devices?: Array<{ name: string; device: string }> }

            if (data.success && data.devices && data.devices.length > 0) {
                // router.refresh() only refetches Server Components. Since the parent WhatsAppSettings
                // is a Client Component fetching data in a useEffect, we need a hard reload
                // so the useEffect re-runs and gets the updated 'connected' state from Supabase.
                window.location.reload()
            } else {
                setError("No devices found. Please scan the QR code first.")
            }
        } catch (err) {
            console.error(err)
            setError("Failed to verify authentication. Please scan it again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Button variant="default" onClick={handleCheckWappAuth} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Verificando...' : 'Ya escaneé el código QR'}
            </Button>
            {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    )
}