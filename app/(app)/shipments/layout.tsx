import Content from "@/components/layout/content"

export const metadata = {
    title: 'Envíos',
    description: 'Envíos',
}

export default function ShipmentsLayout({
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
