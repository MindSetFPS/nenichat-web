import { IMessage } from "@/Nenichat/Messages/domain/IMessage";

export default function DateSeparator({ messages, index }: { messages: IMessage[], index: number }) {
    return (
        <div className="sticky top-0 z-10 bg-muted w-fit mx-auto px-2 py-1 mb-1 rounded border-muted">
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
                    const isSameYear = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear();

                    if (isSameDay(messageDate, today)) {
                        return "Hoy";
                    } else if (isSameDay(messageDate, yesterday)) {
                        return "Ayer";
                    } else {
                        const dayName = messageDate.toLocaleDateString('es-ES', { weekday: 'long' });
                        const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                        const dayMonth = messageDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
                        const year = !isSameYear(messageDate, today) ? ` ${messageDate.getFullYear()}` : '';
                        
                        return `${capitalizedDayName} ${dayMonth}${year}`;
                    }
                })()}
            </p>
        </div>
    )
}