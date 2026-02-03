
'use client';

import { BusinessForm } from './business-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

/**
 * @function CreateBusinessSection
 * @description A section shown to users who haven't created a business yet.
 */
export function CreateBusinessSection() {
    const router = useRouter();

    const handleSuccess = () => {
        // Refresh the page to trigger the server-side check again
        router.refresh();
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Building2 className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Crear un negocio</CardTitle>
                    <CardDescription>
                        Para empezar a usar Nenichat, necesitas crear un negocio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BusinessForm onSuccess={handleSuccess} />
                </CardContent>
            </Card>
        </div>
    );
}
