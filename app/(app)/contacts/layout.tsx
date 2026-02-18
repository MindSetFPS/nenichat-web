import Content from "@/components/layout/content"

export const metadata = {
    title: 'Contactos',
    description: 'Contactos',
}

export default function RootLayout({
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