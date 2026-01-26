
import { create } from 'zustand'
import { ReactNode } from 'react'

interface HeaderStore {
    component: ReactNode | null
    setComponent: (component: ReactNode | null) => void
}

export const useHeaderStore = create<HeaderStore>((set) => ({
    component: null,
    setComponent: (component) => set({ component }),
}))
