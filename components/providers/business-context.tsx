"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Business } from "@/stores/business-store"

interface BusinessContextType {
    business: Business | null
}

const BusinessContext = createContext<BusinessContextType | null>(null)

interface BusinessProviderProps {
    business: Business | null
    children: ReactNode
}

export function BusinessProvider({ business, children }: BusinessProviderProps) {
    return (
        <BusinessContext.Provider value={{ business }}>
            {children}
        </BusinessContext.Provider>
    )
}

export function useBusiness() {
    const context = useContext(BusinessContext)
    if (!context) {
        throw new Error("useBusiness must be used within BusinessProvider")
    }
    return context.business
}
