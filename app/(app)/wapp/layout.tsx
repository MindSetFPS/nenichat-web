import Content from "@/components/layout/content"
import { PageHeader } from "@/components/ui/page-header"

export default function WappLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <Content>
        <div className="p-2">
            <PageHeader title="WhatsApp" />
        </div>
        {children}
    </Content>
}