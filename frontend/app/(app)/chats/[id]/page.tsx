import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository"
import ChatView from "@/components/chat/chat-view"
import ChatHeader from "@/components/chat/chat-header"
import { chatRepository } from "@/Nenichat/Chats/infra/persistance/ChatRepository"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository"
import { pool } from "@/Nenichat/Shared/infra/persistance/db"
import { ChatDropDownDialog } from "@/components/chat/chat-dropdown"
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier"
import { HeaderAction } from "@/components/header-action"
import ChatControls from "@/components/chat/chat-controls"

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const orderRepository = new OrderRepository(pool)
  const params = await paramsPromise
  const chatData = await chatRepository.findById(BigInt(params.id))
  const meData = await contactRepository.findMe()
  const contact = await contactRepository.findById(BigInt(params.id))

  let messages: IMessageWithSender[] = []
  let orders: any[] = []

  if (chatData?.is_group) {
    // A group chat is still a contact that we can name
    messages = await messageRepository.findByChatIdWithSender(params.id, 0, 100)

    // 1. Create a list of unique users that have sent a message
    const userIdSet = new Set(messages.map((message) => message.sender_id))
    const userIdList = Array.from(userIdSet)

    // 2. Loop through the list of users and query every order that belongs to that user
    const ordersList = await Promise.all(userIdList.map((user) => orderRepository.getByContactId(Number(user))))
    orders = ordersList.flat()
  } else {
    messages = await messageRepository.findByChatId(params.id, 0, 100)
    orders = await orderRepository.getByContactId(Number(params.id))
  }

  const contactJson = JSON.parse(JSON.stringify(contact))
  const messagesJson = JSON.parse(JSON.stringify(messages))
  const ordersJson = JSON.parse(JSON.stringify(orders))
  const me = JSON.parse(JSON.stringify(meData))

  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto]">
      <HeaderAction>
        {chatData?.is_group ? (
          <h1 className="text-lg md:text-2xl font-bold w-full">{getContactIdentifier(contactJson)}</h1>
        ) : (
          <ChatHeader contact={contactJson!} />
        )}
        <ChatDropDownDialog contact={contactJson} />
      </HeaderAction>
      <ChatView initialMessages={messagesJson.reverse()} me={me} orders={ordersJson} isGroup={chatData ? chatData.is_group : false} />
      <ChatControls />
    </div>
  )
}
