import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository"
import ChatView from "@/components/chat/chat-view"
import { Suspense } from "react"

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise

  const contactData = await contactRepository.findById(BigInt(params.id))
  const messagesData = await messageRepository.findByChatId(params.id, 0, 100)
  const meData = await contactRepository.findMe()

  const contact = JSON.parse(JSON.stringify(contactData))
  const messages = JSON.parse(JSON.stringify(messagesData))
  const me = JSON.parse(JSON.stringify(meData))

  return (
    <div className="container mx-auto h-[calc(100vh-2rem)] flex flex-col rounded-lg mx-w-4xl">
      <Suspense fallback={<p>Loading...</p>}>
        <ChatView initialMessages={messages.reverse()} contact={contact} me={me} />
      </Suspense>
    </div>
  )
}
