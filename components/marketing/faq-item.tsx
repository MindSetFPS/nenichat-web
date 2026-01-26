export function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold text-lg mb-2">{question}</h3>
            <p className="text-muted-foreground">{answer}</p>
        </div>
    )
}