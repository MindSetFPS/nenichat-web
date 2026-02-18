import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import { GoWappMessageRepository } from "@/Nenichat/Messages/infra/api"
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api"
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { pool } from "@/Nenichat/Shared/infra/persistance/db"
import ChatView from "@/components/chat/chat-view"
import ChatControls from "@/components/chat/chat-controls"

export default async function ChatPage({
  params: paramsPromise
}: {
  params: Promise<{ id: string }>
}) {
  // get business id from supabase
  const contactRepository = new SupabaseContactRepository()
  const orderRepository = new OrderRepository(pool)
  const gowappChatRepository = new GoWappChatRepository("http://192.168.1.64:5100")
  const gowappMessageRepository = new GoWappMessageRepository("http://192.168.1.64:5100")

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized</div>
  }

  // query business id from supabase
  // i feel like this should be done by the client, will i query the same data 
  // every time i open a chat?
  // apparently, nextjs does detect duplicate queries and caches them, but i must make sure
  const { data: business, error } = await supabase
    .from("business")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  if (error) {
    console.log("error", error)
  }

  if (!business) {
    return <div>Business not found</div>
  }

  const params = await paramsPromise
  const lid = decodeURIComponent(params.id)
  const chatData = await gowappChatRepository.findById(lid)
  // const meData = await contactRepository.findMe(1)
  const meData = await contactRepository.findMe(business.id)

  // todo: setMe() we currently does not have a way to tell the app what is my profile
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

  // console.log("chatData", chatData)

  if (chatData?.is_group) {
    console.log("group chat")
    // A group chat is still a contact that we can name
    messages = await gowappMessageRepository.findByChatIdWithSender(lid, 0, 100)
    console.log("messages", messages)

    // 1. Create a list of unique users that have sent a message
    const userIdSet = new Set(messages.map((message) => message.sender_id))
    const userIdList = Array.from(userIdSet)

    // 2. Loop through the list of users and query every order that belongs to that user
    const ordersList = await Promise.all(userIdList.map((user) => orderRepository.getByContactId(business.id, Number(user))))
    orders = ordersList.flat()
  } else {
    messages = await gowappMessageRepository.findByChatId(lid, 0, 10)
    const numericId = parseInt(lid.split('@')[0], 10)
    orders = await orderRepository.getByContactId(business.id, numericId)
  }

  // if the last message belongs to a customer, then check in database if there is suggestions and 
  // include themn in te response.
  // if there is not suggestion, generate them. 
  // also, the message should not belong to hidden contacts, othetwise it would be a waste of tokens

  const contactJson = JSON.parse(JSON.stringify(chatData))
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
        isGroup={false} />

      <ChatControls
        // phone={contactJson?.phone}
        lastMessages={mostRecentMessages}
        me={me}
        suggestions={suggestionsJson}
      />
    </div>
  )
}
