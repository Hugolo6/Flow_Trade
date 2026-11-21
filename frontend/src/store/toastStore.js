import { create } from 'zustand'

let timer
export const useToastStore = create((set) => ({
  message: null,
  show: (message) => {
    clearTimeout(timer)
    set({ message })
    timer = setTimeout(() => set({ message: null }), 2800)
  },
  hide: () => set({ message: null }),
}))
