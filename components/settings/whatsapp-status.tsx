"use client"

import { useWappContainer } from "@/hooks/use-wapp-container"
import { EmptyChats } from "../chat/empty-chats"
import { Spinner } from "../ui/spinner"
import { useBusiness } from "../providers/business-context"
import WappBusinessMissing from "../wapp/wapp-business-missing"
import WappConnected from "../wapp/wapp-connected"

export default function WhatsAppStatus() {
    const { container, isContainerLoaded } = useWappContainer()
    const business = useBusiness()

    if (!business?.id) {
        return <WappBusinessMissing />
    }

    if (!isContainerLoaded) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    if (!container) {
        return <EmptyChats />
    }

    if (container.status === 'connected') {
        return <WappConnected container={container} businessId={business.id} />
    }

    return <EmptyChats />
}
