'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Algo salió mal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Lo sentimos, ha ocurrido un error inesperado.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => router.back()}>
                            Volver atrás
                        </Button>
                        <Button onClick={() => router.push('/home')}>
                            Ir al inicio
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
