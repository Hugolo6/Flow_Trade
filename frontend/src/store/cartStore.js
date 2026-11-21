import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Un artículo del carrito = una variante (color + talla) de un producto.
export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),

      addItem: (item) =>
        set((state) => {
          const found = state.items.find((i) => i.variantId === item.variantId)
          if (!found) return { items: [...state.items, { ...item, qty: 1 }] }
          return {
            items: state.items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, qty: Math.min(i.qty + 1, i.stock) }
                : i,
            ),
          }
        }),

      setQty: (variantId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i,
          ),
        })),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      setItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'urban-wear-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export const selectCount = (s) => s.items.reduce((n, i) => n + i.qty, 0)
export const selectSubtotal = (s) => s.items.reduce((n, i) => n + i.price * i.qty, 0)
