import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WappPause() {
    return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Ban className="h-6 w-6 text-muted-foreground" />
            <div>
                <p className="font-semibold">Instancia pausada</p>
                <p className="text-sm text-muted-foreground mt-1">Tu conexión ha sido pausada. Contacta a soporte para más información.</p>
            </div>
            <Button size="sm" variant="secondary" asChild>
                <Link href="/support">Contactar soporte</Link>
            </Button>
        </div>
    )
}
