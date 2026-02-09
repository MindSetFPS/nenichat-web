import { IMessage } from "@/Nenichat/Messages/domain/IMessage";

export default function DateSeparator({ messages, index }: { messages: IMessage[], index: number }) {
    return (
        <div className="sticky top-0 z-10 bg-muted w-min mx-auto px-2 py-1 mb-1 rounded border-muted shadow-lg">
            <p
                className="text-xs text-muted-foreground "
                key={index}
            >
                {(() => {
                    const messageDate = new Date(messages[0].created_at);
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);

                    const isSameDay = (d1: Date, d2: Date) =>
                        d1.getFullYear() === d2.getFullYear() &&
                        d1.getMonth() === d2.getMonth() &&
                        d1.getDate() === d2.getDate();

                    if (isSameDay(messageDate, today)) {
                        return "Hoy";
                    } else if (isSameDay(messageDate, yesterday)) {
                        return "Ayer";
                    } else {
                        return messageDate.toLocaleDateString('en-GB'); // dd/mm/yyyy format
                    }
                })()}
            </p>
        </div>
    )
}