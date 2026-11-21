import { useEffect } from 'react'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { fallbackBanners, fallbackCategories, fallbackProducts, fallbackSettings } from '@/lib/fallbackData'

const demo = {
  status: 'ready',
  source: 'demo',
  categories: fallbackCategories,
  products: fallbackProducts,
  banners: fallbackBanners,
  settings: fallbackSettings,
}

// El catálogo se lee una sola vez y se comparte entre todas las pantallas
export const useCatalogStore = create((set, get) => ({
  status: 'idle',
  source: 'supabase',
  categories: [],
  products: [],
  banners: [],
  settings: fallbackSettings,

  load: async () => {
    if (get().status !== 'idle') return
    set({ status: 'loading' })
    if (!supabase) return set(demo)
    try {
      const [cats, prods, bans, sets] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*, categories(slug), product_variants(*)').order('created_at'),
        supabase.from('banners').select('*').order('sort_order'),
        supabase.from('store_settings').select('*'),
      ])
      const failed = [cats, prods, bans, sets].find((r) => r.error)
      if (failed) throw failed.error
      set({
        status: 'ready',
        source: 'supabase',
        categories: cats.data,
        products: prods.data.map((p) => ({
          ...p,
          price: Number(p.price),
          compare_at_price: p.compare_at_price == null ? null : Number(p.compare_at_price),
        })),
        banners: bans.data,
        settings: { ...fallbackSettings, ...Object.fromEntries(sets.data.map((s) => [s.key, Number(s.value)])) },
      })
    } catch (err) {
      console.warn('No se pudo leer Supabase, se muestran datos de demostración:', err)
      set(demo)
    }
  },
}))

export function useCatalog() {
  const state = useCatalogStore()
  const load = useCatalogStore((s) => s.load)
  useEffect(() => { load() }, [load])
  return { ...state, loading: state.status !== 'ready' }
}
