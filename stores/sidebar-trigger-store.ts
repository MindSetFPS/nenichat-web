import { create } from 'zustand'

interface SidebarTriggerStore {
  visible: boolean
  setVisible: (v: boolean) => void
}

export const useSidebarTriggerStore = create<SidebarTriggerStore>((set) => ({
  visible: true,
  setVisible: (v: boolean) => set({ visible: v }),
}))
