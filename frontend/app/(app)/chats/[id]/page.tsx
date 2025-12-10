import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository"
import ChatView from "@/components/chat/chat-view"
import { PageHeader } from "@/components/ui/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ChatHeader from "@/components/chat/chat-header"
import { chatRepository } from "@/Nenichat/Chats/infra/persistance/ChatRepository"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import GroupChatView from "@/components/chat/group-chat-view"
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository"
import { pool } from "@/Nenichat/Shared/infra/persistance/db"
import { ChatDropDownDialog } from "@/components/chat/chat-dropdown"

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
            <div className="flex items-center gap-2 w-full">
              <Avatar>
                <AvatarFallback>
                  GR
                </AvatarFallback>
              </Avatar>
              <h1 className="text-lg md:text-2xl font-bold w-full">Este chat es un grupo</h1>
              <ChatDropDownDialog contact={JSON.parse(JSON.stringify(chatData))!} showEditDialog={false} />
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

    const orderRepository = new OrderRepository(pool)
    const contactOrders = await orderRepository.getByContactId(Number(params.id))
    messages = JSON.parse(JSON.stringify(messagesData))

    const orders = JSON.parse(JSON.stringify(contactOrders))
    return (
      <>
        <PageHeader content={
          <div className="md:flex items-center gap-2 w-full">
            <ChatHeader contact={contact!} />
          </div>
        } />
        <ChatView initialMessages={messages.reverse()} me={me} orders={orders} />
      </>
    )
  }
}
