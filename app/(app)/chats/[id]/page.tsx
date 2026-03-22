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

  const jidKind = getJidKind(jid);
  let chatData = null;
  try {
    // Attempt to find the chat session in GoWapp.
    // NOTE: For new contacts or people we haven't messaged yet, this might return null.
    // We don't 404 immediately because we want to allow starting a new conversation.
    chatData = await gowappChatRepository.findById(jid)
  } catch (e) {
    console.error(`Error finding chat ${jid}:`, e);
  }

  const meData = await contactRepository.findMe(business.id)

  // Retrieve contact info from our local CRM database as a fallback
  let contactInfo = null;
  const isLid = jidIsLid(jid) || jidIsGroup(jid)

  if (jidIsPhoneNumber(jid)) {
    contactInfo = await contactRepository.findByPhoneNumber(business.id, jidToNumeric(jid));
  } else if (jidIsLid(jid) || jidIsGroup(jid)) {
    contactInfo = await contactRepository.findByLid(business.id, jid);
  }

  // If we don't have chat data and it's an unknown JID, and we don't have contact info, then 404
  if (!chatData && jidKind === 'unknown' && !contactInfo) {
    return notFound();
  }

  // If the chat session doesn't exist in GoWapp yet (new interaction)
  if (!chatData) {
    // SECURITY/DATA INTEGRITY: If it's a completely new number (not in CRM and no chat history),
    // verify it actually exists on WhatsApp to prevent URL typos from creating "garbage" contacts.
    if (!contactInfo && (jidIsPhoneNumber(jid) || jidIsLid(jid))) {
      const exists = await gowappChatRepository.checkPhone(jid);
      if (!exists) {
        return notFound();
      }
    }

    // Create a local placeholder for the UI so the page can render
    chatData = {
      jid: jid,
      name: contactInfo?.pushname || contactInfo?.username || jidToNumeric(jid),
      last_message_time: new Date(),
      ephemeral_expiration: 0,
      is_group: jidIsGroup(jid),
      created_at: new Date(),
      updated_at: new Date(),
    }
  }

  // If we have a valid JID and it's not already in our CRM, save it now.
  // This ensures the contact exists for orders, tags, etc. even before the first message.
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

  try {
    if (chatData?.is_group) {
      // Group Chat Logic: Fetch messages and identify unique senders to look up their CRM contacts
      messages = await gowappMessageRepository.findByChatIdWithSender(jid, 0, 100)

      // 1. Create a list of unique users that have sent a message
      const userIdSet = new Set(messages.map((message) => message.sender_jid))
      const userIdList = Array.from(userIdSet)

      // 2. Remove elements that end in "@g.us"
      const filteredUserIdList = userIdList.filter((user) => !user.endsWith("@g.us"))

      // 3. Fetch (or create) contacts for group message senders
      if (filteredUserIdList.length > 0) {
        const groupSenderContacts = await Promise.all(
          filteredUserIdList.map((jid) => contactRepository.getOrCreateContact(business.id, jid))
        )
        groupSenderContactsJson = JSON.stringify(groupSenderContacts)
      }

      // 4. Fetch orders for all group participants
      const ordersList = await Promise.all(filteredUserIdList.map((user) => orderRepository.getOrdersByPhone(business.id, user)))
      orders = ordersList.flat()
    } else {
      // Direct Chat Logic: Fetch standard conversation history
      messages = await gowappMessageRepository.findByChatId(jid, 0, 30)
      if (contactInfo && contactInfo.id) {
        orders = await orderRepository.getByContactId(business.id, contactInfo.id)
      }
    }
  } catch (e) {
    console.error(`Error fetching messages for chat ${jid}:`, e);
    // If fetching fails (e.g. chat doesn't exist in backend yet), we still want to show the page with empty history.
    messages = []
    if (!chatData?.is_group && contactInfo && contactInfo.id) {
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
