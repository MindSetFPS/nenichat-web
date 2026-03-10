'use client'

import { useEffect } from 'react'
import { BusinessForm } from "@/components/forms/business-form"
import { Spinner } from "@/components/ui/spinner"
import { useBusinessStore } from "@/stores/business-store"

/**
 * @function BusinessSettings
 * @description Renders the business info settings view using the BusinessForm.
 */
export function BusinessSettings() {
    const { business, isLoading, fetchBusiness } = useBusinessStore()

    useEffect(() => {
        fetchBusiness()
    }, [fetchBusiness])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Información del Negocio</h3>
                <p className="text-sm text-muted-foreground">
                    Actualiza la información básica de tu marca.
                </p>
            </div>
            <BusinessForm initialData={business} />
        </div>
    )
}
