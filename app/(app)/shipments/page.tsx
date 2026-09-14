import { Truck } from "lucide-react"
import { EmptyList } from "@/components/empty-list"
import { PageHeader } from "@/components/ui/page-header"

export default function ShipmentsPage() {
    return (
        <>
            <PageHeader title="Envíos" />
            <EmptyList
                title="Próximamente"
                description="Estamos trabajando en los envíos de paquetes. Muy pronto podrás despachar y seguir tus paquetes desde aquí."
                icon={<Truck className="w-16 h-16 text-primary" strokeWidth={1.5} />}
            />
        </>
    )
}
