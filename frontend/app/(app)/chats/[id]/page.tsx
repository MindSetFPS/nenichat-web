import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository"
import ChatView from "@/components/chat/chat-view"
import { PageHeader } from "@/components/ui/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ChatHeader from "@/components/chat/chat-header"
import { chatRepository } from "@/Nenichat/Chats/infra/persistance/ChatRepository"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import GroupChatView from "@/components/chat/group-chat-view"

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const chatData = await chatRepository.findById(BigInt(params.id))

  const meData = await contactRepository.findMe()
  const me = JSON.parse(JSON.stringify(meData))

  let messages: IMessageWithSender[] = []

  if (chatData?.is_group) {

    const messageData = await messageRepository.findByChatIdWithSender(params.id, 0, 100)
    messages = JSON.parse(JSON.stringify(messageData))

    return (
      <>
        <PageHeader content={
          <div className="md:flex items-center gap-2 w-full">
            <div className="flex items-center gap-2 w-full max-w-xs">
              <Avatar>
                <AvatarFallback>
                  GR
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold ">Este chat es un grupo</h1>
            </div>
          </div>
        }
        />
        <GroupChatView initialMessages={messages.reverse()} me={me} />
      </>
    )
  } else {
    const contactData = await contactRepository.findById(BigInt(params.id))
    const messagesData = await messageRepository.findByChatId(params.id, 0, 100)
    const contact = JSON.parse(JSON.stringify(contactData))
    messages = JSON.parse(JSON.stringify(messagesData))

    return (
      <>
        <PageHeader content={
          <div className="md:flex items-center gap-2 w-full">
            <ChatHeader contact={contact!} />
          </div>
        } />
        <ChatView initialMessages={messages.reverse()} me={me} />
      </>
    )
  }
}
