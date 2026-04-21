
'use client';

import { BusinessForm } from './business-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Building2, Sparkles } from 'lucide-react';

/**
 * @function CreateBusinessSection
 * @description A beautifully designed section shown to users who haven't created a business yet.
 */
export function CreateBusinessSection() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect to home after successful business creation
        router.push('/home');
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[90vh] lg:min-h-0 lg:py-8 px-4 overflow-hidden w-full">
            {/* Elegant Background Decorations */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
                <div className="absolute top-0 -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] opacity-50" />
                <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-lg mx-auto bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-white/20 dark:border-zinc-800/20 shadow-xl shadow-zinc-200/20 dark:shadow-none">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                            <div className="relative flex items-center justify-center w-16 h-16 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                                <Building2 className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                    </div>
                    
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Tu nuevo negocio
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                        Completa los detalles para comenzar a usar Nenichat.
                    </p>
                </div>

                <div className="relative">
                    <BusinessForm onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
}
