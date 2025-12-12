import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository"
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import MessageDetailView from "@/components/chat/message-detail-view"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function MessagePage({ params }: PageProps) {
    const { id } = await params
    const message = await messageRepository.findById(id)

    if (!message) {
        notFound()
    }

    let sender = undefined
    if (message.sender_id) {
        sender = await contactRepository.findById(BigInt(message.sender_id)) || undefined
    }

    const serializedMessage = {
        id: message.id,
        text_content: message.text_content,
        created_at: message.created_at.toISOString(),
    }

    const serializedSender = sender ? {
        pushname: sender.pushname,
        contact_name: sender.contact_name,
        phone_number: sender.phone_number,
    } : undefined

    return <MessageDetailView message={serializedMessage} sender={serializedSender} />
}
