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
  const gowappChatRepository = new GoWappChatRepository({ deviceId: String(business.id) })
  const gowappMessageRepository = new GoWappMessageRepository({ deviceId: String(business.id) })

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
  let groupSenderContactsJson = '[]'

  const me = JSON.parse(JSON.stringify(meData))
  const suggestions = [
    { action: "send_message", label: "¡Buenos días!", text: "¡Buenos días!" },
    { action: "send_message", label: "Hola", text: "Hola" },
  ]
  const suggestionsJson = JSON.parse(JSON.stringify(suggestions))

  if (!chatData?.is_group) {
    try {
      messages = await gowappMessageRepository.findByChatId(jid, 0, 30)
      if (contactInfo?.id) {
        orders = await orderRepository.getByContactId(business.id, contactInfo.id)
      }
    } catch (e) {
      console.error(`Error fetching messages for chat ${jid}:`, e);
    }

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await orderRepository.getItems(business.id, order.id)
      }))
    )

    const messagesJson = JSON.parse(JSON.stringify(messages))
    const ordersJson = JSON.parse(JSON.stringify(ordersWithItems))
    const mostRecentMessages = messagesJson.reverse().slice(-10)
    const contactJson = JSON.parse(JSON.stringify(contactInfo))

    return (
      <div className="h-dvh flex flex-col">
        <ChatView
          initialMessages={messagesJson}
          orders={ordersJson}
          jid={jid}
          isGroup={false}
          me={me}
          initialContact={contactJson}
        />

        <ChatControls
          phone={jid}
          lastMessages={mostRecentMessages}
          me={me}
          suggestions={suggestionsJson}
        />
      </div>
    )
  }

  try {
    messages = await gowappMessageRepository.findByChatIdWithSender(jid, 0, 100)

    const userIdSet = new Set(messages.map((message) => message.sender_jid))
    const userIdList = Array.from(userIdSet)
    const filteredUserIdList = userIdList.filter((user) => !user.endsWith("@g.us"))

    groupSenderContactsJson = '[]'
    if (filteredUserIdList.length > 0) {
      const groupSenderContacts = await Promise.all(
        filteredUserIdList.map((jid) => contactRepository.getOrCreateContact(business.id, jid))
      )
      groupSenderContactsJson = JSON.stringify(groupSenderContacts)
    }

    const ordersList = await Promise.all(
      filteredUserIdList.map((user) => orderRepository.getOrdersByPhone(business.id, user))
    )
    orders = ordersList.flat()
  } catch (e) {
    console.error(`Error fetching messages for chat ${jid}:`, e);
  }

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => ({
      ...order,
      items: await orderRepository.getItems(business.id, order.id)
    }))
  )

  const messagesJson = JSON.parse(JSON.stringify(messages))
  const ordersJson = JSON.parse(JSON.stringify(ordersWithItems))
  const mostRecentMessages = messagesJson.reverse().slice(-10)
  const contactJson = JSON.parse(JSON.stringify(contactInfo || chatData))

  return (
    <div className="h-dvh flex flex-col">
      <ChatView
        chatName={chatData?.name}
        initialMessages={messagesJson}
        me={me}
        orders={ordersJson}
        isGroup={true}
        jid={jid}
        initialContact={contactJson}
        groupSenderContacts={groupSenderContactsJson} />

      <ChatControls
        phone={jid}
        lastMessages={mostRecentMessages}
        me={me}
        suggestions={suggestionsJson}
      />
    </div>
  )
}
