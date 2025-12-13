import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository"
import ChatView from "@/components/chat/chat-view"
import { PageHeader } from "@/components/ui/page-header"
import ChatHeader from "@/components/chat/chat-header"
import { chatRepository } from "@/Nenichat/Chats/infra/persistance/ChatRepository"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository"
import { pool } from "@/Nenichat/Shared/infra/persistance/db"
import { ChatDropDownDialog } from "@/components/chat/chat-dropdown"
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier"

export default async function ChatPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const chatData = await chatRepository.findById(BigInt(params.id))

  const meData = await contactRepository.findMe()
  const me = JSON.parse(JSON.stringify(meData))

  let messages: IMessageWithSender[] = []

  if (chatData?.is_group) {
    // A group chat is still a contact that we can name
    const contactData = await contactRepository.findById(chatData.id)
    const contact = JSON.parse(JSON.stringify(contactData))

    const messageData = await messageRepository.findByChatIdWithSender(params.id, 0, 100)
    messages = JSON.parse(JSON.stringify(messageData))

    // In an individual chat we would query any order that belongs to that individual.
    // For a group chat, we will query every order that belongs to every user in the chat.

    // 1. Create a list of unique users that have sent a message
    const userIdSet = new Set(messageData.map((message) => message.sender_id))
    const userIdList = Array.from(userIdSet)

    // 2. Loop through the list of users and query every order that belongs to that user
    const orderRepository = new OrderRepository(pool)
    const orders = await Promise.all(userIdList.map((user) => orderRepository.getByContactId(Number(user))))

    // 3. Combine the orders into a single array
    const combinedOrders = orders.flat()

    // 4. Convert to json parse to avoid nextjs errors
    const ordersJson = JSON.parse(JSON.stringify(combinedOrders))
    return (
      <>
        <PageHeader content={
          <div className="md:flex items-center gap-2 w-full">
            <div className="flex items-center gap-2 w-full">
              <h1 className="text-lg md:text-2xl font-bold w-full">{getContactIdentifier(contact)}</h1>
              <ChatDropDownDialog contact={JSON.parse(JSON.stringify(chatData))!} />
            </div>
          </div>
        }
        />
        <ChatView initialMessages={messages.reverse()} me={me} orders={ordersJson} />
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
