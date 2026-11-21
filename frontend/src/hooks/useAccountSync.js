import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { kindFor } from '@/components/Garment'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'

const CART_SELECT =
  'variant_id, quantity, product_variants(id, color_name, color_hex, size, stock, image_url, products(id, name, price, image_url, is_active, categories(slug)))'

// Al iniciar sesión: une lo que hay en este equipo con lo guardado en la cuenta
async function mergeFromServer(userId) {
  const [cartRes, favRes] = await Promise.all([
    supabase.from('cart_items').select(CART_SELECT).eq('user_id', userId),
    supabase.from('favorites').select('product_id').eq('user_id', userId),
  ])
  if (cartRes.error || favRes.error) throw cartRes.error ?? favRes.error

  // Si una variante está en ambos lados gana la cantidad mayor (sin pasar del stock)
  const merged = new Map(useCartStore.getState().items.map((i) => [i.variantId, i]))
  for (const row of cartRes.data) {
    const v = row.product_variants
    const p = v?.products
    if (!v || !p?.is_active || v.stock < 1) continue
    const qty = Math.min(row.quantity, v.stock)
    const existing = merged.get(v.id)
    if (existing) {
      merged.set(v.id, { ...existing, stock: v.stock, qty: Math.min(Math.max(existing.qty, qty), v.stock) })
    } else {
      merged.set(v.id, {
        variantId: v.id, productId: p.id, name: p.name, colorName: v.color_name, colorHex: v.color_hex,
        size: v.size, price: Number(p.price), stock: v.stock, qty,
        kind: kindFor({ name: p.name, categorySlug: p.categories?.slug }),
        imageUrl: v.image_url ?? p.image_url ?? null,
      })
    }
  }
  useCartStore.getState().setItems([...merged.values()])
  useFavoritesStore.getState().setIds([
    ...new Set([...useFavoritesStore.getState().ids, ...favRes.data.map((f) => f.product_id)]),
  ])
}

async function pushCart(userId, items) {
  if (items.length) {
    await supabase.from('cart_items').upsert(
      items.map((i) => ({ user_id: userId, variant_id: i.variantId, quantity: i.qty })),
      { onConflict: 'user_id,variant_id' },
    )
  }
  let del = supabase.from('cart_items').delete().eq('user_id', userId)
  if (items.length) del = del.not('variant_id', 'in', `(${items.map((i) => i.variantId).join(',')})`)
  await del
}

async function pushFavorites(userId, productIds) {
  if (productIds.length) {
    await supabase.from('favorites').upsert(
      productIds.map((id) => ({ user_id: userId, product_id: id })),
      { onConflict: 'user_id,product_id' },
    )
  }
  let del = supabase.from('favorites').delete().eq('user_id', userId)
  if (productIds.length) del = del.not('product_id', 'in', `(${productIds.join(',')})`)
  await del
}

// Se monta una vez (Layout): carrito y favoritos viajan con la cuenta. Es de mejor esfuerzo:
// si falla, la tienda sigue funcionando con lo guardado en el navegador.
export function useAccountSync() {
  const userId = useAuthStore((s) => s.user?.id)
  const items = useCartStore((s) => s.items)
  const favoriteIds = useFavoritesStore((s) => s.ids)
  const [synced, setSynced] = useState(false)
  const timer = useRef()

  useEffect(() => {
    setSynced(false)
    if (!userId || !supabase) return
    let cancelled = false
    mergeFromServer(userId)
      .catch((err) => console.warn('No se pudo leer el carrito y los favoritos de la cuenta:', err))
      .finally(() => { if (!cancelled) setSynced(true) })
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => {
    if (!userId || !synced) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      Promise.all([pushCart(userId, items), pushFavorites(userId, favoriteIds)])
        .catch((err) => console.warn('No se pudo guardar en la cuenta:', err))
    }, 500)
    return () => clearTimeout(timer.current)
  }, [userId, synced, items, favoriteIds])
}
