import { FaqItem } from "../../faq-item";

export default function FaqSection() {
    return (
        <section id="faq" className="py-24 bg-background">
            <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground text-lg">
                        Everything you need to know about Nenichat.
                    </p>
                </div>
                <div className="space-y-4">
                    <FaqItem
                        question="Do I need the WhatsApp Business API?"
                        answer="Yes, Nenichat connects directly to the official WhatsApp Business API to ensure reliability and compliance. We help you through the verification process."
                    />
                    <FaqItem
                        question="Can I use my existing WhatsApp number?"
                        answer="Absolutely. You can migrate your current business number to our platform without losing your identity."
                    />
                    <FaqItem
                        question="Does the AI really handle sales?"
                        answer="Our AI is trained to handle product inquiries, recommend items based on your catalog, and guide customers to checkout. For complex issues, it seamlessly hands over to a human agent."
                    />
                    <FaqItem
                        question="Is there a setup fee?"
                        answer="No. We believe in earning your business. You only pay the monthly subscription fee."
                    />
                </div>
            </div>
        </section>
    )
}