"use client"

import { cn } from "@/lib/utils"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { IMessage } from "@/Nenichat/Messages/domain/IMessage"
import { useState, useRef, useEffect } from "react"
import ChatControls from "./chat-controls"

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  return (
    <>
      <main className="flex-1 h-full overflow-y-auto p-4 flex-col space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
              message.sender_id === me?.id
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            <p>{message.text_content}</p>
            <span
              className={cn(
                "text-xs self-end",
                message.sender_id === me?.id
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              )}
            >
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      <ChatControls />
    </>
  )
}
