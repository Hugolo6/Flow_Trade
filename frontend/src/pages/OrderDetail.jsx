import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Thumb } from '@/components/Thumb'
import { StatusPill, formatOrderDate } from '@/components/OrderStatus'
import { kindFor } from '@/components/Garment'
import { formatPrice } from '@/lib/format'
import { supabase } from '@/lib/supabase'

export default function OrderDetail() {
  const { id } = useParams()
  const [state, setState] = useState({ status: 'loading', order: null })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', order: null })
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setState({ status: 'error', order: null })
        else setState({ status: data ? 'ready' : 'missing', order: data })
      })
    return () => { cancelled = true }
  }, [id])

  const { status, order } = state

  return (
    <section aria-labelledby="titulo-pedido" className="mx-auto max-w-[920px] pb-6">
      <Link to="/pedidos" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Mis pedidos
      </Link>

      {status === 'loading' && <div aria-busy="true" className="mt-6 h-72 animate-pulse rounded-[18px] bg-stone" />}

      {(status === 'missing' || status === 'error') && (
        <div role="alert" className="mt-6 grid place-items-center rounded-[18px] border border-dashed border-line px-6 py-16 text-center">
          <TriangleAlert className="size-9 text-muted" aria-hidden />
          <h1 id="titulo-pedido" className="mt-3 text-xl font-semibold">
            {status === 'missing' ? 'No encontramos este pedido' : 'No pudimos cargar el pedido'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {status === 'missing' ? 'Puede que el enlace sea incorrecto o que el pedido sea de otra cuenta.' : 'Revisa tu conexión e inténtalo de nuevo.'}
          </p>
          <Button asChild className="mt-5"><Link to="/pedidos">Ver mis pedidos</Link></Button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 id="titulo-pedido" className="text-3xl font-bold tracking-tight">Pedido #{order.order_number}</h1>
              <p className="mt-1 text-muted">{formatOrderDate(order.created_at)}</p>
            </div>
            <StatusPill status={order.status} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <ul className="divide-y divide-line rounded-[18px] bg-card px-5 ring-1 ring-line">
                {order.order_items.map((it) => (
                  <li key={it.id} className="flex items-center gap-4 py-4">
                    <Thumb kind={kindFor({ name: it.product_name, categorySlug: it.category_slug })} color={it.color_hex} className="size-[72px]" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{it.product_name}</p>
                      <p className="text-sm text-muted">
                        {[it.color_name, it.size !== 'Única' && it.size].filter(Boolean).join(' / ')} · x{it.quantity}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums">{formatPrice(it.unit_price * it.quantity)}</p>
                  </li>
                ))}
              </ul>

              <div className="grid gap-6 rounded-[18px] bg-card p-5 ring-1 ring-line sm:grid-cols-2">
                <div>
                  <h2 className="text-sm text-muted">Enviar a</h2>
                  <p className="mt-1 font-medium leading-relaxed">
                    {order.shipping_address.full_name}<br />
                    {order.shipping_address.street}, {order.shipping_address.neighborhood}<br />
                    {order.shipping_address.city}{order.shipping_address.state ? `, ${order.shipping_address.state}` : ''}, CP {order.shipping_address.postal_code}
                  </p>
                  <p className="mt-2 text-sm text-muted">{order.shipping_address.email} · {order.shipping_address.phone}</p>
                </div>
                <div>
                  <h2 className="text-sm text-muted">Pago</h2>
                  <p className="mt-1 font-medium leading-relaxed">
                    {order.payment_method ?? 'Tarjeta (simulado)'}
                    {order.card_last4 && <><br />Terminada en {order.card_last4}</>}
                  </p>
                  {order.payment_reference && <p className="mt-2 font-mono text-[13px] text-muted">{order.payment_reference}</p>}
                </div>
              </div>
            </div>

            <aside aria-label="Resumen del pedido" className="h-fit rounded-[18px] bg-card p-5 ring-1 ring-line">
              <h2 className="text-lg font-bold">Resumen del pedido</h2>
              <dl className="mt-4 space-y-2.5 text-[15px]">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between"><dt className="text-muted">Primera compra</dt><dd className="tabular-nums text-done">−{formatPrice(order.discount)}</dd></div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Envío</dt>
                  <dd className="tabular-nums">{Number(order.shipping_cost) === 0 ? 'Gratis' : formatPrice(order.shipping_cost)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
              </dl>
            </aside>
          </div>
        </>
      )}
    </section>
  )
}
