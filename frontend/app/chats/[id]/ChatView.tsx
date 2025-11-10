"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { IContact } from "@/repository/IContact"
import { IMessage } from "@/repository/IMessage"
import { ArrowLeft, MoreVertical, Paperclip, Send, Smile } from "lucide-react"
import { useState } from "react"

interface ChatViewProps {
  initialMessages: IMessage[]
  contact: IContact | null
  me: IContact | null
}

export default function ChatView({
  initialMessages,
  contact,
  me,
}: ChatViewProps) {
  const [messages, setMessages] = useState<IMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    // Sending messages is disabled for now.
    if (newMessage.trim() === "") return
    console.log("Sending message:", newMessage)
    setNewMessage("")
  }

  const contactName =
    contact?.username || contact?.contact_name || contact?.pushname

  return (
    <div className="flex flex-col h-full ">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="sm:hidden">
            <ArrowLeft />
          </Button>
          <Avatar>
            <AvatarImage
              src={
                contact?.username
                  ? `https://github.com/${contact.username}.png`
                  : "https://github.com/shadcn.png"
              }
              alt={contactName || "Contact"}
            />
            <AvatarFallback>
              {contactName?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">
              {contactName || "Unknown Contact"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {contact?.phone_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <MoreVertical />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                message.sender_id === me?.id.toString()
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p>{message.text_content}</p>
              <span
                className={cn(
                  "text-xs self-end",
                  message.sender_id === me?.id.toString()
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
        </div>
      </main>

      <footer className="p-4 border-t shrink-0">
        <form
          className="flex items-center gap-4"
          onSubmit={handleSendMessage}
        >
          <div className="flex items-center gap-2 flex-1">
            <Button variant="ghost" size="icon">
              <Smile />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled
            />
            <Button variant="ghost" size="icon" disabled>
              <Paperclip />
            </Button>
          </div>
          <Button type="submit" size="icon" disabled>
            <Send />
          </Button>
        </form>
      </footer>
    </div>
  )
}
