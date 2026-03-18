'use client'

import { BusinessForm } from "@/components/forms/business-form"
import { useBusiness } from "@/components/providers/business-context"

/**
 * @function BusinessSettings
 * @description Renders the business info settings view using the BusinessForm.
 */
export function BusinessSettings() {
    const business = useBusiness()

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
