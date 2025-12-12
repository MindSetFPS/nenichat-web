"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { IMessage } from "@/Nenichat/Messages/domain/IMessage"
import ChatControls from "./chat-controls"
import Message from "./message"
import OrderMessage from "./order-message"
import DateSeparator from "./date-separator"
import { Order } from "@/Nenichat/Orders/domain/Order"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"

// Union type for timeline items
type TimelineItem =
  | { type: 'message'; data: IMessageWithSender }
  | { type: 'order'; data: Order }

interface ChatViewProps {
  initialMessages: IMessageWithSender[]
  me: IContact | null,
  orders: Order[]
}

export default function ChatView({
  initialMessages,
  me,
  orders,
}: ChatViewProps) {
  const [messages, setMessages] = useState<IMessageWithSender[]>(initialMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Merge messages and orders, then sort by created_at
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [
      ...messages.map(msg => ({ type: 'message' as const, data: msg })),
      ...orders.map(order => ({ type: 'order' as const, data: order }))
    ]

    // Sort by created_at timestamp
    return items.sort((a, b) => {
      const dateA = new Date(a.data.created_at).getTime()
      const dateB = new Date(b.data.created_at).getTime()
      return dateA - dateB
    })
  }, [messages, orders])

  // Group timeline items by date
  const groupedTimeline = useMemo(() => {
    const grouped = timelineItems.reduce((accumulator, item) => {
      const date = new Date(item.data.created_at).toLocaleDateString()
      if (!accumulator[date]) {
        accumulator[date] = []
      }
      accumulator[date].push(item)
      return accumulator
    }, {} as Record<string, TimelineItem[]>)
    return Object.entries(grouped).map(([date, items]) => ({ date, items }))
  }, [timelineItems])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, orders])

  return (
    <>
      <main className="flex-1 h-full overflow-y-auto -mx-2 p-2 flex-col space-y-2">
        {groupedTimeline.map((group, groupIndex) => (
          <div key={groupIndex}>
            <DateSeparator
              messages={group.items
                .filter(item => item.type === 'message')
                .map(item => item.data as IMessageWithSender)}
              index={groupIndex}
            />
            <div className="space-y-2">
              {group.items.map((item, itemIndex) => (
                item.type === 'message' ? (
                  <Message
                    message={item.data as IMessageWithSender}
                    me={me}
                    key={`message-${itemIndex}`}
                  />
                ) : (
                  <OrderMessage
                    order={item.data as Order}
                    key={`order-${itemIndex}`}
                  />
                )
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      <ChatControls />
    </>
  )
}
