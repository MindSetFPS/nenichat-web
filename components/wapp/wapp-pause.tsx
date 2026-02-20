import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WappPause() {
    return (
        <Card className="border-muted-foreground/20 bg-muted/30 dark:bg-muted/10 rounded-3xl">
            <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Ban className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Instancia Pausada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Tu conexión ha sido pausada. Contacta a soporte para más información.
                </p>
                <Button asChild variant="secondary" className="w-full rounded-xl">
                    <Link href="/support">Contactar Soporte</Link>
                </Button>
            </CardContent>
        </Card>
    )
}