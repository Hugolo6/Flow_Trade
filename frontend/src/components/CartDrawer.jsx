import { useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Truck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Garment } from '@/components/Garment'
import { formatPrice } from '@/lib/format'
import { selectCount, selectSubtotal, useCartStore } from '@/store/cartStore'

const PAYMENT_SEALS = ['Visa', 'Mastercard', 'PayPal', 'Mercado Pago']

export function CartDrawer({ freeShippingFrom }) {
  const isOpen = useCartStore((s) => s.isOpen)
  const setOpen = useCartStore((s) => s.setOpen)
  const items = useCartStore((s) => s.items)
  const count = useCartStore(selectCount)
  const subtotal = useCartStore(selectSubtotal)
  const setQty = useCartStore((s) => s.setQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const navigate = useNavigate()

  const missing = Math.max(0, freeShippingFrom - subtotal)
  const progress = Math.min(100, (subtotal / freeShippingFrom) * 100)

  function go(path) {
    setOpen(false)
    navigate(path)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <SheetTitle className="text-xl font-bold">Tu carrito ({count})</SheetTitle>
          <SheetClose className="grid size-9 place-items-center rounded-[10px] hover:bg-stone" aria-label="Cerrar carrito">
            <X className="size-5" />
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">Artículos en tu carrito y resumen de pago</SheetDescription>

        {items.length === 0 ? (
          <div className="grid flex-1 place-content-center justify-items-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-stone">
              <ShoppingBag className="size-7" aria-hidden />
            </span>
            <p className="mt-5 text-lg font-semibold">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-muted">Agrega una prenda y aparecerá aquí.</p>
            <Button className="mt-6" onClick={() => go('/productos')}>Seguir comprando</Button>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <p className="flex items-center gap-2 text-sm">
                <Truck className="size-4 shrink-0" aria-hidden />
                {missing > 0
                  ? <>Te faltan <strong>{formatPrice(missing)}</strong> para el envío gratis</>
                  : <strong>Tu pedido tiene envío gratis</strong>}
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-stone" role="progressbar"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Progreso hacia envío gratis">
                <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <div className="grid size-[84px] shrink-0 place-items-center overflow-hidden rounded-[12px] bg-stone p-2">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt="" className="size-full object-cover" />
                      : <Garment kind={item.kind} color={item.colorHex} className="h-auto w-full" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold">{item.name}</p>
                        <p className="mt-0.5 text-[13px] text-muted">
                          {item.colorName}{item.size !== 'Única' && ` / ${item.size}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Quitar ${item.name} del carrito`}
                        className="-mr-1.5 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-stone hover:text-ink"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-line">
                        <button onClick={() => setQty(item.variantId, item.qty - 1)} disabled={item.qty <= 1}
                          aria-label="Quitar una unidad" className="grid size-8 place-items-center rounded-full hover:bg-stone disabled:opacity-35">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">{item.qty}</span>
                        <button onClick={() => setQty(item.variantId, item.qty + 1)} disabled={item.qty >= item.stock}
                          aria-label="Agregar una unidad" className="grid size-8 place-items-center rounded-full hover:bg-stone disabled:opacity-35">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-[15px] font-bold tabular-nums">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-white px-6 pb-6 pt-5">
              <dl className="flex items-baseline justify-between">
                <dt className="text-base font-medium">Subtotal</dt>
                <dd className="text-xl font-bold tabular-nums">{formatPrice(subtotal)}</dd>
              </dl>
              <p className="mt-1 text-[13px] text-muted">El envío y el cupón se calculan al finalizar la compra.</p>
              <div className="mt-4 grid gap-2.5">
                <Button size="lg" onClick={() => go('/checkout')}>Finalizar compra</Button>
                <Button size="lg" variant="secondary" onClick={() => go('/carrito')}>Ver carrito</Button>
              </div>
              <ul className="mt-5 flex flex-wrap items-center justify-center gap-2" aria-label="Medios de pago aceptados">
                {PAYMENT_SEALS.map((name) => (
                  <li key={name} className="rounded-md border border-line px-2.5 py-1 text-[11px] font-bold tracking-wide text-ink/70">
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
