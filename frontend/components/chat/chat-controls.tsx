"use client"

import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

export default function ChatControls() {
    const [newMessage, setNewMessage] = useState("")

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        // Sending messages is disabled for now.
        if (newMessage.trim() === "") return
        setNewMessage("")
    }

    return (
        <footer className="p-4 border-t shrink-0 -m-4">
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
    )
}
