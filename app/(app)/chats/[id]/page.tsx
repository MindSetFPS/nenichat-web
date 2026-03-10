import { notFound } from "next/navigation"
import { getBusinessFromUser } from "@/lib/user-auth"
import { GoWappMessageRepository } from "@/Nenichat/Messages/infra/api"
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api"
import { getJidKind, jidIsGroup, jidIsLid, jidIsPhoneNumber, jidToNumeric } from "@/Nenichat/Chats/domain/Jid"
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import ChatView from "@/components/chat/chat-view"
import ChatControls from "@/components/chat/chat-controls"

export default async function ChatPage({
  params: paramsPromise
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { business, error: authError } = await getBusinessFromUser(supabase)

  if (authError || !business) {
    return <div>Unauthorized</div>
  }

  const contactRepository = new SupabaseContactRepository(supabase)
  const orderRepository = new SupabaseOrderRepository(supabase)
  const gowappBaseUrl = "http://192.168.1.64/api/user/" + business.id
  const gowappChatRepository = new GoWappChatRepository(gowappBaseUrl, "admin", "admin")
  const gowappMessageRepository = new GoWappMessageRepository(gowappBaseUrl, "admin", "admin")

  const params = await paramsPromise
  const jid = decodeURIComponent(params.id)

  // Basic guard against invalid IDs (static assets or misrouted requests)
  if (jid.includes('.') && !jid.includes('@')) {
    return notFound();
  }

  let chatData = null;
  try {
    chatData = await gowappChatRepository.findById(jid)
    if (!chatData) {
      return notFound();
    }
  } catch (e) {
    console.error(`Error finding chat ${jid}:`, e);
    return notFound();
  }

  const meData = await contactRepository.findMe(business.id)

  // retrieve contact info with lid or phone number
  let contactInfo = null;
  if (chatData) {
    const jidKind = getJidKind(jid);
    const isLid = jidIsLid(jid) || jidIsGroup(jid)

    if (jidIsPhoneNumber(jid)) {
      contactInfo = await contactRepository.findByPhoneNumber(business.id, jidToNumeric(jid));
    } else {
      contactInfo = await contactRepository.findByLid(business.id, jid);
    }

    if (jidKind !== 'unknown') {
      if (!contactInfo) {
        contactInfo = await contactRepository.save({
          business_id: business.id,
          is_user: false,
          pushname: chatData.name || null,
          ...(isLid ? { lid: jid } : { phone_number: jidToNumeric(jid) })
        });
      }
    }
  }

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

  let groupSenderContactsJson = '[]'

  if (chatData?.is_group) {
    // A group chat is still a contact that we can name
    messages = await gowappMessageRepository.findByChatIdWithSender(jid, 0, 100)

    // 1. Create a list of unique users that have sent a message
    const userIdSet = new Set(messages.map((message) => message.sender_jid))
    const userIdList = Array.from(userIdSet)

    // 2. Remove elements that end in "@g.us"
    const filteredUserIdList = userIdList.filter((user) => !user.endsWith("@g.us"))

    // 3. Fetch contacts for group message senders
    const contactLookups: { value: string; is_lid: boolean }[] = filteredUserIdList.map((user) => ({
      value: user,
      is_lid: user.includes('@lid'),
    }))
    if (contactLookups.length > 0) {
      const groupSenderContacts = await contactRepository.findBatchByPhoneOrLid(business.id, contactLookups)
      groupSenderContactsJson = JSON.stringify(groupSenderContacts)
    }

    // 4. Loop through the list of users and query every order that belongs to that user
    const ordersList = await Promise.all(filteredUserIdList.map((user) => orderRepository.getOrdersByPhone(business.id, user)))
    orders = ordersList.flat()
  } else {
    messages = await gowappMessageRepository.findByChatId(jid, 0, 10)
    // orders = await orderRepository.getByContactId(business.id, numericId)
    if (contactInfo && contactInfo.id) {
      orders = await orderRepository.getByContactId(business.id, contactInfo.id)
    }
  }

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await orderRepository.getItems(business.id, order.id)
      return { ...order, items }
    })
  )

  // if the last message belongs to a customer, then check in database if there is suggestions and 
  // include themn in te response.
  // if there is not suggestion, generate them. 
  // also, the message should not belong to hidden contacts, othetwise it would be a waste of tokens

  const contactJson = JSON.parse(JSON.stringify(contactInfo || chatData))
  const messagesJson = JSON.parse(JSON.stringify(messages))
  const ordersJson = JSON.parse(JSON.stringify(ordersWithItems))
  const me = JSON.parse(JSON.stringify(meData))
  const suggestionsJson = JSON.parse(JSON.stringify(suggestions))

  let mostRecentMessages = messagesJson.reverse()
  mostRecentMessages = mostRecentMessages.slice(-10)

  return (
    <div className="h-full grid grid-rows-[1fr_auto]">
      <ChatView
        contact={contactJson}
        chatName={chatData?.name}
        initialMessages={messagesJson.reverse()}
        me={me}
        orders={ordersJson}
        isGroup={chatData?.is_group}
        groupSenderContacts={groupSenderContactsJson} />

      <ChatControls
        // phone={contactJson?.phone}
        lastMessages={mostRecentMessages}
        me={me}
        suggestions={suggestionsJson}
      />
    </div>
  )
}
