"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import Message from "./message"
import OrderMessage from "./order-message"
import DateSeparator from "./date-separator"
import { Order } from "@/Nenichat/Orders/domain/Order"
import { IOrderItemWithProduct } from "@/Nenichat/Orders/domain/IOrderItemWithProduct"
import type { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import ChatHeader from "./chat-header"
import { ChatDropDownDialog } from "./chat-dropdown"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { getContactName } from "@/Nenichat/Contacts/app/get-contact-name"
import { useContactStore } from "@/stores/contact-store"
import { useMessageStore } from "@/stores/message-store"

// Union type for timeline items
type TimelineItem =
  | { type: 'message'; data: IMessageWithSender }
  | { type: 'order'; data: Order & { items?: IOrderItemWithProduct[] } }

interface ChatViewProps {
  initialMessages: IMessageWithSender[]
  me?: IContact | null,
  isGroup: boolean,
  orders: Order[],
  jid?: string,
  chatName?: string
  groupSenderContacts?: string
  initialContact?: IContact | null
}

export default function ChatView({
  initialMessages,
  isGroup,
  orders,
  jid,
  chatName,
  groupSenderContacts,
  initialContact,
}: ChatViewProps) {
  const setContacts = useContactStore((state) => state.setContacts)
  const setContact = useContactStore((state) => state.setContact)
  const setMessages = useMessageStore((state) => state.setMessages)
  const storedMessages = useMessageStore((state) => jid ? state.messagesByChat[jid] : undefined)

  useEffect(() => {
    if (groupSenderContacts) {
      const contacts = JSON.parse(groupSenderContacts) as IContact[];
      if (contacts.length > 0) {
        setContacts(contacts);
      }
    }
    if (initialContact) {
      setContact(initialContact);
    }
    if (jid) {
      setMessages(jid, initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const router = useRouter()
  const isMobile = useIsMobile()
  const getContact = useContactStore((state) => state.getContact)

  const contact = initialContact || (jid ? getContact(jid) : null)

  const messages = storedMessages ?? initialMessages

  // Merge messages and orders, then sort by created_at
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [
      ...messages.map((msg: IMessageWithSender) => ({ type: 'message' as const, data: msg })),
      ...orders.map(order => ({ type: 'order' as const, data: order }))
    ]

    // Sort by created_at timestamp (newest first for flex-col-reverse)
    return items.sort((a, b) => {
      const dateA = new Date(a.data.created_at).getTime()
      const dateB = new Date(b.data.created_at).getTime()
      return dateB - dateA
    })
  }, [messages, orders])

  // Group timeline items (messages/orders) by their date
  const groupedTimeline = useMemo(() => {
    // reduce() iterates over our array to build a single outcome (our grouped object)
    const grouped = timelineItems.reduce((accumulator, item) => {
      // Get the readable date string (e.g., "12/12/2025") from the item's creation time
      const date = new Date(item.data.created_at).toLocaleDateString()

      // If this date isn't in our accumulator yet, initialize it with an empty array
      if (!accumulator[date]) {
        accumulator[date] = []
      }

      // Add the current item to the list for this specific date
      accumulator[date].push(item)

      // Return the updated accumulator for the next iteration
      return accumulator
    }, {} as Record<string, TimelineItem[]>) // The initial value is an empty object

    // Convert the grouped object { "date": [items] } into an array [{ date, items }]
    // Sort items within each group oldest-first
    return Object.entries(grouped).map(([date, items]) => ({
      date,
      items: items.sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime())
    }))
  }, [timelineItems]) // Re-run this logic only when timelineItems changes

  // Pre-calculate which messages should show avatar (consecutive same sender = hide avatar)
  const messageAvatarVisibility = useMemo(() => {
    const visibility: Record<number, boolean> = {}
    let prevSenderJid: string | undefined
    let prevIsFromMe: boolean | undefined

    timelineItems.forEach((item, index) => {
      if (item.type !== 'message') {
        visibility[index] = true
        return
      }
      const msg = item.data as IMessageWithSender
      const currentSender = msg.is_from_me ? 'me' : msg.sender_jid

      // Show avatar if: different sender, different "me" status, or it's an order
      const showAvatar = prevSenderJid !== currentSender || prevIsFromMe !== msg.is_from_me
      visibility[index] = showAvatar

      prevSenderJid = currentSender
      prevIsFromMe = msg.is_from_me
    })
    return visibility
  }, [timelineItems])

  return (
    <main className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 flex items-center justify-between py-2 bg-stone-50 dark:bg-neutral-900 border-b px-2">
        <div className="flex items-center gap-2 flex-1">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            {isGroup ? (
              <h1 className="text-lg md:text-2xl font-bold">{getContactName(contact) || "Unknown"}</h1>
            ) : (
              <ChatHeader contact={contact!} chatName={chatName} />
            )}
          </div>
        </div>
        {contact && <ChatDropDownDialog contact={contact} isGroup={isGroup} />}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col-reverse p-2 space-y-4">
        {groupedTimeline.map((group, groupIndex) => (
          <div key={groupIndex}>
            <DateSeparator
              messages={group.items
                .map(item => item.data as IMessageWithSender)}
              index={groupIndex}
            />
            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const globalIndex = timelineItems.indexOf(item)
                const showAvatar = isGroup && messageAvatarVisibility[globalIndex]
                return (
                  item.type === 'message' ? (
                    <Message
                      message={item.data as IMessageWithSender}
                      isMe={(item.data as IMessageWithSender).is_from_me}
                      isGroup={isGroup}
                      showAvatar={showAvatar}
                      key={`message-${itemIndex}`}
                    />
                  ) : (
                    <OrderMessage
                      order={item.data as Order}
                      items={(item.data as Order & { items?: IOrderItemWithProduct[] }).items}
                      key={`order-${itemIndex}`}
                      isGroup={isGroup}
                    />
                  )
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
