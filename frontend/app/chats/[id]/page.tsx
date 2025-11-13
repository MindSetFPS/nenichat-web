import { contactRepository } from "@/repository/ContactRepository"
import { messageRepository } from "@/repository/MessageRepository"
import ChatView from "./ChatView"
import { Suspense } from "react"

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise

  const contactData = await contactRepository.findById(BigInt(params.id))
  const messagesData = await messageRepository.findByChatId(params.id, 0, 100)
  const meData = await contactRepository.findMe()

  const contact = JSON.parse(JSON.stringify(contactData))
  const messages = JSON.parse(JSON.stringify(messagesData))
  const me = JSON.parse(JSON.stringify(meData))

  // const classess = "flex flex-col h-full bg-background max-w-4xl mx-auto border rounded-lg overflow-hidden"
  const classess = "flex flex-col h-full border rounded-lg mx-w-4xl"

  return (
    <div className="h-full">
      <div className={classess}>
        <Suspense fallback={<p>Loading...</p>}>
          <ChatView initialMessages={messages.reverse()} contact={contact} me={me} />
        </Suspense>
      </div>
    </div>
  )
}
