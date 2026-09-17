import { useWappStore } from "@/stores/wapp-store"
import { EmptyChats } from "../chat/empty-chats"
import { useBusiness } from "../providers/business-context"
import WappConnected from "../wapp/wapp-connected"

export default function WhatsAppStatus() {
    const { container, isContainerLoaded } = useWappStore()
    const business = useBusiness()

    if (!business?.id) {
        // send him to create a business
    }

    if (!isContainerLoaded) {
        return <EmptyChats />
    }

    if (!container) {
        return <EmptyChats />
    }

    const status = container.status

    if (status === 'connected') {
        return <WappConnected container={container} businessId={business!.id} />
    } else {
        return <EmptyChats />
    }
}   