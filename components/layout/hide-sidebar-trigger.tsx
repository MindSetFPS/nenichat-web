'use client'

import { useEffect } from 'react'
import { useSidebarTriggerStore } from '@/stores/sidebar-trigger-store'

export default function HideSidebarTrigger() {
  const setVisible = useSidebarTriggerStore((s) => s.setVisible)

  useEffect(() => {
    setVisible(false)
    return () => setVisible(true)
  }, [setVisible])

  return null
}
