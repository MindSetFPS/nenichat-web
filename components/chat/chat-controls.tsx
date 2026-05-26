"use client"

import { Paperclip, Send, Smile, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ChatAiSuggestions } from "./chat-ai-suggestions";
import { IChatSuggestion } from "@/Nenichat/ChatSuggestions/domain/IChatSuggestion";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { useMessageStore } from "@/stores/message-store";
import type { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender";

interface ChatControlsProps {
    phone?: string;
    lastMessages?: any[];
    me?: IContact | null;
    suggestions?: IChatSuggestion[];
}

/**
 * Chat controls component with AI response suggestions.
 * @param props - Component properties including phone and previous messages context.
 * @returns {JSX.Element} The rendered chat controls footer.
 */
export default function ChatControls({ phone, lastMessages, me, suggestions }: ChatControlsProps) {
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const addMessage = useMessageStore((state) => state.addMessage)

    /**
     * Handles sending a message.
     * @param messageText - The text content of the message to send.
     */
    const handleSendMessage = async (messageText: string) => {
        if (!phone || messageText.trim() === "" || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message: messageText }),
                signal: AbortSignal.timeout(60000), // 1 minute timeout
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message) {
                    addMessage(phone, data.message as IMessageWithSender);
                }
                setNewMessage("");
                toast.success("Message sent");
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error("Error sending message");
        } finally {
            setIsSending(false);
        }
    };

    /**
     * Handles the form submission.
     * @param e - The form event.
     */
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(newMessage);
    };

    return (
        <footer className="p-2 border-t bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
            <ChatAiSuggestions
                lastMessages={lastMessages}
                onSuggestionClick={handleSendMessage}
                disabled={isSending}
                me={me}
                suggestions={suggestions}
            />

            {/* Input Form */}
            <form
                className="flex items-center"
                onSubmit={onSubmit}
            >
                <div
                    className="flex items-center flex-1 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-primary rounded-full h-9 w-9">
                        <Smile className="w-5 h-5" />
                    </Button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border-none bg-transparent focus-visible:ring-0 shadow-none px-2 h-8 text-sm"
                        disabled={isSending}
                    />
                    <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-primary rounded-full h-9 w-9">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                </div>
                <Button
                    type="submit"
                    size="icon"
                    disabled={isSending || newMessage.trim() === ""}
                    className="rounded-2xl h-8 w-8 shadow-lg shadow-primary/20 transition-transform active:scale-95"
                >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
            </form>
        </footer>
    );
}
