import { cn } from "@/lib/utils"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { IMessage } from "@/Nenichat/Messages/domain/IMessage"

interface MessageProps {
    message: IMessage
    me: IContact | null
}

export default function Message({ message, me }: MessageProps) {
    return (
        <div
            key={message.id}
            className={cn(
                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                message.sender_id === me?.id
                    ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted rounded-tl-none"
            )}
        >
            <p className="text-sm">{message.text_content}</p>
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
    )
}