'use client'

import { useState, useEffect } from 'react'
import WhatsAppSetupPage from "@/components/connections/whatsapp/whatsapp-setup-page"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { container_states } from "@/Nenichat/Containers/Domain/container-states"
import { Spinner } from "@/components/ui/spinner"
import { useSearchParams } from 'next/navigation'
import WappError from '../wapp/wapp-error'
import WappPause from '../wapp/wapp-pause'
import WappConnected from '../wapp/wapp-connected'
import WappBusinessMissing from '../wapp/wapp-business-missing'

/**
 * @function WhatsAppSettings
 * @description Renders the WhatsApp connection settings view.
 */
export function WhatsAppSettings() {
    const [loading, setLoading] = useState(true)
    const [businessId, setBusinessId] = useState<number | null>(null)
    const [container, setContainer] = useState<any>(null)
    const supabase = createBrowserSupabaseClient()
    const searchParams = useSearchParams()
    const reconnect = searchParams.get('reconnect') === 'true'

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // 1. Get business
                const { data: businesses } = await supabase
                    .from('business')
                    .select('id')
                    .eq('owner_id', user.id)
                    .limit(1)

                if (!businesses || businesses.length === 0) {
                    setLoading(false)
                    return
                }

                const bId = businesses[0].id
                setBusinessId(bId)

                // 2. Get container
                const { data: containers } = await supabase
                    .from('whatsapp-containers')
                    .select('*')
                    .eq('business_id', bId)
                    .limit(1)

                if (containers && containers.length > 0) {
                    setContainer(containers[0])
                }
            } catch (err) {
                console.error('Error fetching WhatsApp data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    if (!businessId) {
        return <WappBusinessMissing />
    }

    if (container && !reconnect) {
        const status = container.status as container_states

        if (status === 'connected') {
            return <WappConnected container={container} businessId={businessId} />
        }

        if (status === 'error') {
            return <WappError reconnect={reconnect} />
        }

        if (status === 'stopped') {
            return <WappPause />
        }

        if (status === 'deployed') {
            return <WhatsAppSetupPage
                businessId={businessId.toString()}
                initialStep={2}
                initialQrCode={container.qr_code}
                initialQrCodeUpdatedAt={container.qr_code_updated_at}
            />
        }
    }

    // Default setup flow
    return <WhatsAppSetupPage businessId={businessId.toString()} />
}
