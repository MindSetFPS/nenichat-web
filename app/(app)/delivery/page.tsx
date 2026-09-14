import { Motorbike } from "lucide-react"
import { EmptyList } from "@/components/empty-list"
import { PageHeader } from "@/components/ui/page-header"

export default function DeliveryPage() {
    return (
        <>
            <PageHeader title="Entrega" />
            <EmptyList
                title="Próximamente"
                description="Estamos trabajando en la entrega a domicilio con repartidores en moto. Muy pronto podrás coordinar y seguir tus entregas desde aquí."
                icon={<Motorbike className="w-16 h-16 text-primary" strokeWidth={1.5} />}
            />
        </>
    )
}
