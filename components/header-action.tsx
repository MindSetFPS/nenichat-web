
'use client'

import { useHeaderStore } from '@/stores/header-store'
import { useEffect, ReactNode } from 'react'

interface HeaderActionProps {
    children: ReactNode
}

export function HeaderAction({ children }: HeaderActionProps) {
    const setComponent = useHeaderStore((state) => state.setComponent)

    useEffect(() => {
        setComponent(children)
        return () => setComponent(null)
    }, [children, setComponent])

    return null
}
