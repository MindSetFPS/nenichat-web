"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
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
  isGroup: boolean,
  orders: Order[]
}

export default function ChatView({
  initialMessages,
  me,
  isGroup,
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
    // This format is easier to map over when rendering the UI
    return Object.entries(grouped).map(([date, items]) => ({ date, items }))
  }, [timelineItems]) // Re-run this logic only when timelineItems changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, orders])

  return (
    <main className="h-full overflow-y-auto flex-col space-y-2">
      {groupedTimeline.map((group, groupIndex) => (
        <div key={groupIndex}>
          <DateSeparator
            messages={group.items
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
                  isGroup={isGroup}
                />
              )
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </main>
  )
}
