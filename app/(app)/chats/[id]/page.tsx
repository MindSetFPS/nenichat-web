import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository"
import ChatView from "@/components/chat/chat-view"
import { chatRepository } from "@/Nenichat/Chats/infra/persistance/ChatRepository"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository"
import { pool } from "@/Nenichat/Shared/infra/persistance/db"
import ChatControls from "@/components/chat/chat-controls"

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const orderRepository = new OrderRepository(pool)
  const params = await paramsPromise
  const chatData = await chatRepository.findById(BigInt(params.id))
  const meData = await contactRepository.findMe()
  const contact = await contactRepository.findById(BigInt(params.id))

  let messages: IMessageWithSender[] = []
  let orders: any[] = []
  let suggestions: any[] = []

  suggestions.push(
    {
      id: 1,
      chat_id: params.id,
      message_id: "",
      suggestion: "Hello",
      is_selected: false,
      created_at: new Date(),
    },
    {
      id: 2,
      chat_id: params.id,
      message_id: "",
      suggestion: "Hi",
      is_selected: false,
      created_at: new Date(),
    }
  )

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

  // if the last message belongs to a customer, then check in database if there is suggestions and 
  // include themn in te response.
  // if there is not suggestion, generate them. 
  // also, the message should not belong to hidden contacts, othetwise it would be a waste of tokens

  const contactJson = JSON.parse(JSON.stringify(contact))
  const messagesJson = JSON.parse(JSON.stringify(messages))
  const ordersJson = JSON.parse(JSON.stringify(orders))
  const me = JSON.parse(JSON.stringify(meData))
  const suggestionsJson = JSON.parse(JSON.stringify(suggestions))
  let mostRecentMessages = messagesJson.reverse()
  mostRecentMessages = mostRecentMessages.slice(-10)

  return (
    <div className="h-full grid grid-rows-[1fr_auto]">
      <ChatView
        contact={contactJson}
        initialMessages={messagesJson.reverse()}
        me={me}
        orders={ordersJson}
        isGroup={chatData ? chatData.is_group : false} />

      <ChatControls
        phone={contactJson?.phone}
        lastMessages={mostRecentMessages}
        me={me}
        suggestions={suggestionsJson}
      />
    </div>
  )
}
