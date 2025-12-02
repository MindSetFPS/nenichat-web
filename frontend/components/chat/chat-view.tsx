"use client"

import { useState, useRef, useEffect } from "react"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { IMessage } from "@/Nenichat/Messages/domain/IMessage"
import ChatControls from "./chat-controls"
import Message from "./message"
import DateSeparator from "./date-separator"

interface ChatViewProps {
  initialMessages: IMessage[]
  me: IContact | null
}

export default function ChatView({
  initialMessages,
  me,
}: ChatViewProps) {
  const [messages, setMessages] = useState<IMessage[]>(initialMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [groupedMessages, setGroupedMessages] = useState<IMessage[][]>([])

  useEffect(() => {
    const grouped = messages.reduce((accumulator, message) => {
      const date = new Date(message.created_at).toLocaleDateString()
      if (!accumulator[date]) {
        accumulator[date] = []
      }
      accumulator[date].push(message)
      return accumulator
    }, {} as Record<string, IMessage[]>)
    setGroupedMessages(Object.values(grouped))
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])



  return (
    <>
      <main className="flex-1 h-full overflow-y-auto p-2 flex-col space-y-2">
        {groupedMessages.map((messages, index) => (
          <div key={index}>
            <DateSeparator messages={messages} index={index} />
            <div className="space-y-2">
              {messages.map((message, index) => (
                <Message message={message} me={me} key={index} />
              ))}
            </div >
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main >
      <ChatControls />
    </>
  )
}
