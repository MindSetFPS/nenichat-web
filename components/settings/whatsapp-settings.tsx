'use client'

import WhatsAppSetupPage from "@/components/connections/whatsapp/whatsapp-setup-page"
import { Spinner } from "@/components/ui/spinner"
import { useSearchParams } from 'next/navigation'
import WappError from '../wapp/wapp-error'
import WappPause from '../wapp/wapp-pause'
import WappConnected from '../wapp/wapp-connected'
import WappBusinessMissing from '../wapp/wapp-business-missing'
import { useBusiness } from '@/components/providers/business-context'
import WappUnreachable from '../wapp/wapp-unreachable'
import { type ContainerRow } from '@/stores/wapp-store'
import { useWappContainer } from '@/hooks/use-wapp-container'

interface WhatsAppSettingsProps {
    container?: ContainerRow | null
}

export function WhatsAppSettings({ container: containerProp }: WhatsAppSettingsProps) {
    const searchParams = useSearchParams()
    const reconnect = searchParams.get('reconnect') === 'true'

    const business = useBusiness()
    const hasContainerProp = containerProp !== undefined
    const { container: storedContainer, isContainerLoaded } = useWappContainer({ enabled: !hasContainerProp })

    if (!business?.id) {
        return <WappBusinessMissing />
    }

    if (!hasContainerProp && !isContainerLoaded) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    const container = hasContainerProp ? containerProp : storedContainer

    if (container && !reconnect) {
        const status = container.status

        if (status === 'connected') {
            return <WappConnected container={container} businessId={business.id} />
        }

        if (status === 'error') {
            return <WappError />
        }

        if (status === 'stopped') {
            return <WappPause />
        }

        if (status === 'unreachable') {
            return <WappUnreachable businessId={business.id.toString()} />
        }

        if (status === 'deployed') {
            return <WhatsAppSetupPage
                businessId={business.id.toString()}
                initialStep={2}
                initialQrCode={container.qr_code_url}
                initialQrCodeUpdatedAt={container.qr_code_updated_at}
            />
        }
    }

    // Default setup flow
    return <WhatsAppSetupPage businessId={business.id.toString()} />
}
