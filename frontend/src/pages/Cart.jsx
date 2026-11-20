import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Thumb } from '@/components/Thumb'
import { formatPrice } from '@/lib/format'
import { shippingFor } from '@/lib/pricing'
import { useCatalogStore } from '@/store/catalogStore'
import { selectCount, selectSubtotal, useCartStore } from '@/store/cartStore'

export default function Cart() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const count = useCartStore(selectCount)
  const subtotal = useCartStore(selectSubtotal)
  const setQty = useCartStore((s) => s.setQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const settings = useCatalogStore((s) => s.settings)

  const shipping = shippingFor(subtotal, settings)

  if (items.length === 0) {
    return (
      <section className="grid place-items-center py-20 text-center" aria-labelledby="titulo-carrito">
        <span className="grid size-20 place-items-center rounded-full bg-white/80 ring-1 ring-line"><ShoppingBag className="size-9" aria-hidden /></span>
        <h1 id="titulo-carrito" className="mt-6 text-3xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted">Agrega una prenda y aparecerá aquí.</p>
        <Button asChild size="lg" className="mt-7"><Link to="/productos">Seguir comprando</Link></Button>
      </section>
    )
  }

  return (
    <section aria-labelledby="titulo-carrito">
      <h1 id="titulo-carrito" className="text-3xl font-bold tracking-tight sm:text-4xl">Tu carrito <span className="font-medium text-ink/70">({count})</span></h1>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ul className="divide-y divide-line rounded-[20px] bg-white/70 px-5 ring-1 ring-line sm:px-6">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-5 sm:gap-6 sm:py-6">
              <Thumb kind={item.kind} color={item.colorHex} imageUrl={item.imageUrl} className="size-[96px] sm:size-[112px]" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-muted">{item.colorName}{item.size !== 'Única' && ` / ${item.size}`}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Quitar ${item.name} del carrito`}
                    className="-mr-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink/70 hover:bg-stone hover:text-alert"
                  >
                    <Trash2 className="size-[18px]" />
                  </button>
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <div className="flex items-center rounded-[10px] border border-line bg-white">
                    <button onClick={() => setQty(item.variantId, item.qty - 1)} disabled={item.qty <= 1} aria-label={`Quitar una unidad de ${item.name}`} className="grid size-10 place-items-center rounded-l-[10px] hover:bg-stone disabled:opacity-35"><Minus className="size-4" /></button>
                    <span className="w-9 text-center text-sm font-semibold tabular-nums" aria-live="polite">{item.qty}</span>
                    <button onClick={() => setQty(item.variantId, item.qty + 1)} disabled={item.qty >= item.stock} aria-label={`Agregar una unidad de ${item.name}`} className="grid size-10 place-items-center rounded-r-[10px] hover:bg-stone disabled:opacity-35"><Plus className="size-4" /></button>
                  </div>
                  <p className="text-lg font-bold tabular-nums">{formatPrice(item.price * item.qty)}</p>
                </div>
                {item.qty >= item.stock && <p className="mt-2 text-[13px] text-muted">Es todo el stock disponible de esta prenda.</p>}
              </div>
            </li>
          ))}
        </ul>

        <aside aria-label="Resumen del pedido" className="space-y-4 lg:sticky lg:top-28">
          <div className="rounded-[20px] bg-gradient-to-br from-sand/55 to-white/80 p-6 ring-1 ring-line">
            <h2 className="text-lg font-bold">Resumen del pedido</h2>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd></div>
              <div>
                <div className="flex justify-between"><dt>Envío</dt><dd className="font-medium tabular-nums">{formatPrice(shipping)}</dd></div>
                <p className="mt-1 text-[13px] text-muted">(Envío gratis en compras mayores a {formatPrice(settings.free_shipping_threshold).replace('.00', '')})</p>
              </div>
              <div className="flex items-baseline justify-between border-t border-ink/10 pt-4 text-lg font-bold"><dt>Total</dt><dd className="text-xl tabular-nums">{formatPrice(subtotal + shipping)}</dd></div>
            </dl>
            <div className="mt-6 grid gap-3">
              <Button size="lg" onClick={() => navigate('/checkout')}>Finalizar compra <ArrowRight className="size-4" aria-hidden /></Button>
              <Button asChild size="lg" variant="outline"><Link to="/productos">Seguir comprando</Link></Button>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-[20px] bg-sand/60 p-5 ring-1 ring-line">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/80"><Truck className="size-6" aria-hidden /></span>
            <div>
              <p className="font-semibold">Envío gratis</p>
              <p className="text-sm text-ink/70">En compras mayores a {formatPrice(settings.free_shipping_threshold).replace('.00', '')}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
