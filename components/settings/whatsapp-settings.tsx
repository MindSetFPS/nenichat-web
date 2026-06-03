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
import { useBusiness } from '@/components/providers/business-context'

export function WhatsAppSettings() {
    const [loading, setLoading] = useState(true)
    const [container, setContainer] = useState<any>(null)
    const supabase = createBrowserSupabaseClient()
    const searchParams = useSearchParams()
    const reconnect = searchParams.get('reconnect') === 'true'

    const business = useBusiness()

    useEffect(() => {
        async function fetchContainer() {
            if (!business?.id) {
                setLoading(false)
                return
            }

            try {
                const { data: containers } = await supabase
                    .from('whatsapp-containers')
                    .select('*')
                    .eq('business_id', business.id)
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

        fetchContainer()
    }, [business, supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    if (!business?.id) {
        return <WappBusinessMissing />
    }

    if (container && !reconnect) {
        const status = container.status as container_states

        if (status === 'connected') {
            return <WappConnected container={container} businessId={business.id} />
        }

        if (status === 'error') {
            return <WappError />
        }

        if (status === 'stopped') {
            return <WappPause />
        }

        if (status === 'deployed') {
            return <WhatsAppSetupPage
                businessId={business.id.toString()}
                initialStep={2}
                initialQrCode={container.qr_code}
                initialQrCodeUpdatedAt={container.qr_code_updated_at}
            />
        }
    }

    // Default setup flow
    return <WhatsAppSetupPage businessId={business.id.toString()} />
}
