import { IMessage } from "@/Nenichat/Messages/domain/IMessage";

export default function DateSeparator({ messages, index }: { messages: IMessage[], index: number }) {
    return (
        <div className="sticky top-0 z-10 bg-muted w-min mx-auto px-2 py-1 rounded border-muted shadow-lg">
            <p
                className="text-xs text-muted-foreground "
                key={index}
            >
                {new Date(messages[0].created_at).toLocaleDateString()}
            </p>
        </div>
    )
}