'use client'

import { useState, useEffect } from 'react'
import { BusinessForm } from "@/components/forms/business-form"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

/**
 * @function BusinessSettings
 * @description Renders the business info settings view using the BusinessForm.
 */
export function BusinessSettings() {
    const [business, setBusiness] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createBrowserSupabaseClient()

    useEffect(() => {
        async function fetchBusiness() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: businesses } = await supabase
                    .from('business')
                    .select('*')
                    .eq('owner_id', user.id)
                    .limit(1)

                if (businesses && businesses.length > 0) {
                    setBusiness(businesses[0])
                }
            } catch (err) {
                console.error('Error fetching business:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchBusiness()
    }, [supabase])

    if (loading) {
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
