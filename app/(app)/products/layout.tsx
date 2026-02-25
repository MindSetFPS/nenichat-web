import Content from "@/components/layout/content";

export default function Layout({
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