import { useMemo, useState } from 'react'
import { Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Garment, kindFor } from '@/components/Garment'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useToastStore } from '@/store/toastStore'

export function ProductCard({ product }) {
  const variants = product.product_variants ?? []

  // Colores únicos, en el orden en que llegan de la base de datos
  const colors = useMemo(() => {
    const seen = new Map()
    variants.forEach((v) => { if (!seen.has(v.color_name)) seen.set(v.color_name, v.color_hex) })
    return [...seen].map(([name, hex]) => ({ name, hex }))
  }, [variants])

  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0]
  const [colorName, setColorName] = useState(firstInStock?.color_name)
  const sizes = variants.filter((v) => v.color_name === colorName)
  const [size, setSize] = useState(firstInStock?.size)

  const selected = sizes.find((v) => v.size === size) ?? sizes.find((v) => v.stock > 0) ?? sizes[0]
  const color = colors.find((c) => c.name === colorName)

  const favorite = useFavoritesStore((s) => s.ids.includes(product.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const toast = useToastStore((s) => s.show)

  const kind = kindFor({ name: product.name, categorySlug: product.categories?.slug })
  const onSale = product.compare_at_price && product.compare_at_price > product.price
  const soldOut = !selected || selected.stock < 1

  function chooseColor(name) {
    setColorName(name)
    const next = variants.filter((v) => v.color_name === name)
    // Conserva la talla si existe en el nuevo color; si no, toma la primera con stock
    const keep = next.find((v) => v.size === size && v.stock > 0)
    setSize((keep ?? next.find((v) => v.stock > 0) ?? next[0]).size)
  }

  function add() {
    if (soldOut) return
    addItem({
      variantId: selected.id,
      productId: product.id,
      name: product.name,
      colorName: selected.color_name,
      colorHex: selected.color_hex,
      size: selected.size,
      price: product.price,
      stock: selected.stock,
      kind,
      imageUrl: selected.image_url ?? product.image_url ?? null,
    })
    toast(`${product.name} agregado al carrito`)
    openCart()
  }

  return (
    <article className="flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-stone">
        {selected?.image_url || product.image_url ? (
          <img src={selected?.image_url ?? product.image_url} alt={product.name} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center p-[14%]">
            <Garment kind={kind} color={color?.hex} title={`${product.name}, color ${colorName}`} className="h-auto w-full" />
          </div>
        )}

        <button
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={favorite}
          aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white shadow-sm transition-transform hover:scale-105"
        >
          <Heart className={cn('size-[19px]', favorite && 'fill-alert text-alert')} />
        </button>

        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-alert px-2.5 py-1 text-xs font-bold text-white">Oferta</span>
        )}
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug">{product.name}</h3>
        <p className="text-[15px] font-bold tabular-nums">{formatPrice(product.price)}</p>
      </div>
      {onSale && (
        <p className="text-sm text-muted line-through tabular-nums">{formatPrice(product.compare_at_price)}</p>
      )}

      <div className="mt-2.5 flex items-center gap-2" role="radiogroup" aria-label="Color">
        {colors.map((c) => (
          <button
            key={c.name}
            role="radio"
            aria-checked={c.name === colorName}
            aria-label={c.name}
            title={c.name}
            onClick={() => chooseColor(c.name)}
            className={cn(
              'size-[22px] rounded-full border border-ink/20 transition-shadow',
              c.name === colorName && 'ring-2 ring-ink ring-offset-2',
            )}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      {sizes.length > 1 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Talla">
          {sizes.map((v) => (
            <button
              key={v.id}
              role="radio"
              aria-checked={v.size === selected?.size}
              disabled={v.stock < 1}
              onClick={() => setSize(v.size)}
              className={cn(
                'min-w-9 rounded-[8px] border px-2.5 py-1 text-[13px] font-medium disabled:cursor-not-allowed disabled:text-muted disabled:line-through',
                v.size === selected?.size ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink',
              )}
            >
              {v.size}
            </button>
          ))}
        </div>
      )}
      {sizes.length === 1 && sizes[0].size !== 'Única' && (
        <p className="mt-2 text-[13px] text-muted">Talla {sizes[0].size}</p>
      )}

      <div className="mt-auto pt-3.5"><Button variant="outline" size="sm" className="w-full" onClick={add} disabled={soldOut}>
        <ShoppingBag className="size-4" aria-hidden />
        {soldOut ? 'Agotado' : 'Agregar al carrito'}
      </Button></div>
    </article>
  )
}
