
import { RecreateButton } from '@/components/chat/recreate-button'
import { AlertTriangle } from 'lucide-react'


export default function WappUnreachable({ businessId }: { businessId: string }) {
    return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="font-semibold">Contenedor no disponible</p>
            <p className="text-sm text-muted-foreground">
                El contenedor de WhatsApp no está respondiendo.
                Recrea el contenedor para restablecer la conexión.
            </p>
            <RecreateButton businessId={businessId} />
        </div>
    )
}       