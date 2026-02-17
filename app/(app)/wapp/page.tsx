import Content from "@/components/layout/content";
import { WhatsAppSettings } from "@/components/settings/whatsapp-settings";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
    title: "WhatsApp",
    description: "WhatsApp",
}

export default function WappPage() {
    return (
        <WhatsAppSettings />
    )
}