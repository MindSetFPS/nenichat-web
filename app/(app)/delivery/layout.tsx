import Content from "@/components/layout/content"

export const metadata = {
    title: 'Entrega',
    description: 'Entrega',
}

export default function DeliveryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Content className="p-4 scroll-auto overflow-y-auto">
            {children}
        </Content>
    )
}
