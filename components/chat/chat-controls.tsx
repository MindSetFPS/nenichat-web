"use client"

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Paperclip, Send, Smile, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChatAiSuggestions } from "./chat-ai-suggestions";
import { TemplateQuickAnswers } from "@/components/templates/template-quick-answers";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { useMessageStore } from "@/stores/message-store";
import { useProductStore } from "@/stores/product-store";
import { useContactStore } from "@/stores/contact-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CreateOrderForm } from "@/components/forms/create-order-form";
import type { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender";
import type { SuggestionAction } from "@/Nenichat/Suggestions/domain/ISuggestionAction";
import type { ProductOrder } from "@/Nenichat/Orders/app/dto/product-order";
import { mapExtractedProductsToEcommerceProducts } from "@/Nenichat/Orders/app/product-matching";

interface ChatControlsProps {
    phone?: string;
    lastMessages?: any[];
    me?: IContact | null;
    suggestions?: SuggestionAction[];
}

export default function ChatControls({ phone, lastMessages, me, suggestions }: ChatControlsProps) {
    const router = useRouter()
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const addMessage = useMessageStore((state) => state.addMessage)
    const { products, fetchProducts } = useProductStore()
    const getContact = useContactStore((state) => state.getContact)
    const customerContact = phone ? getContact(phone) : undefined
    const customerContactValue = typeof customerContact === 'object' ? customerContact : undefined
    const [pendingFormAction, setPendingFormAction] = useState<SuggestionAction | null>(null)

    const handleSendMessage = async (messageText: string) => {
        if (!phone || messageText.trim() === "" || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message: messageText }),
                signal: AbortSignal.timeout(60000),
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

    const handleSuggestionAction = (action: SuggestionAction) => {
        if (action.action === "send_message") {
            handleSendMessage(action.text);
        } else if (action.action === "open_form") {
            if (products.length === 0) fetchProducts();
            setPendingFormAction(action);
        }
    };

    const handleCloseForm = () => {
        setPendingFormAction(null);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(newMessage);
    };

    const renderFormModal = () => {
        if (!pendingFormAction || pendingFormAction.action !== "open_form") return null;

        const orders = (pendingFormAction.data as { orders?: ProductOrder[] }).orders;
        const initialItems = orders ? mapExtractedProductsToEcommerceProducts(orders, products) : [];

        return (
            <Sheet open={true} onOpenChange={(open) => { if (!open) handleCloseForm(); }}>
                <SheetContent className="scroll-auto overflow-y-auto px-2">
                    <SheetHeader className="p-0 pt-2">
                        <SheetTitle>Crear venta</SheetTitle>
                    </SheetHeader>
                    <CreateOrderForm
                        contact={customerContactValue}
                        initialItems={initialItems}
                        onSubmit={() => {
                            handleCloseForm()
                            router.refresh()
                        }}
                    />
                </SheetContent>
            </Sheet>
        );
    };

    return (
        <footer className="p-2 border-t bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
            <ChatAiSuggestions
                lastMessages={lastMessages}
                onSuggestionClick={handleSendMessage}
                onSuggestionAction={handleSuggestionAction}
                disabled={isSending}
                me={me}
                suggestions={suggestions}
            />

            <TemplateQuickAnswers onSelectTemplate={setNewMessage} disabled={isSending} />

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

            {renderFormModal()}
        </footer>
    );
}
