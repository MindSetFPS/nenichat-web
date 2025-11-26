import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository"
import ChatView from "@/components/chat/chat-view"
import { Suspense } from "react"
import { PageHeader } from "@/components/ui/page-header"
import ContactAvatar from "@/components/contact-avatar"
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ChatHeader from "@/components/chat/chat-header"
import Link from "next/link"

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise

  const contactData = await contactRepository.findById(BigInt(params.id))
  const messagesData = await messageRepository.findByChatId(params.id, 0, 100)
  const meData = await contactRepository.findMe()

  const contact = JSON.parse(JSON.stringify(contactData))
  const messages = JSON.parse(JSON.stringify(messagesData))
  const me = JSON.parse(JSON.stringify(meData))

  return (
    <>
      <PageHeader content={
        <div className="md:flex items-center gap-2 w-full">
          <div className="flex items-center gap-2 w-full max-w-xs">
            <Avatar>
              <ContactAvatar seed={getContactIdentifier(contact)!} />
              <AvatarFallback>
                {getContactIdentifier(contact)?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            <Link href={`/contacts/${contact.id}`}>
              <h1 className="text-2xl font-bold ">{contact.pushname || contact.username || contact.phone_number}</h1>
            </Link>
          </div>

          <ChatHeader contact={contact!} />
        </div>
      } />

      {/* <div className="container mx-auto flex flex-col h-full rounded-lg mx-w-4xl"> */}
      {/* <Suspense fallback={<p>Loading...</p>}> */}
      <ChatView initialMessages={messages.reverse()} me={me} />
      {/* </Suspense> */}
      {/* </div> */}
    </>
  )
}
