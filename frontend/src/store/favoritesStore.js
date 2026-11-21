import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Guarda ids de producto. Más adelante se sincroniza con la tabla `favorites` al iniciar sesión.
export const useFavoritesStore = create(
  persist(
    (set) => ({
      ids: [],
      setIds: (ids) => set({ ids }),
      reset: () => set({ ids: [] }),
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
    }),
    { name: 'urban-wear-favorites' },
  ),
)
