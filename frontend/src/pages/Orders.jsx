import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Package, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Thumb } from '@/components/Thumb'
import { StatusPill, ORDER_STATUS, formatOrderDate } from '@/components/OrderStatus'
import { kindFor } from '@/components/Garment'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { supabase } from '@/lib/supabase'

const TABS = [
  { key: 'transit', label: 'En tránsito', empty: 'No tienes pedidos en tránsito.' },
  { key: 'delivered', label: 'Entregados', empty: 'Todavía no tienes pedidos entregados.' },
  { key: 'cancelled', label: 'Cancelados', empty: 'No tienes pedidos cancelados.' },
]

function OrderCard({ order }) {
  const first = order.order_items[0]
  const extra = order.order_items.length - 1
  return (
    <li>
      <Link
        to={`/pedidos/${order.id}`}
        className="group flex items-center gap-4 rounded-[18px] bg-card p-4 ring-1 ring-line transition-shadow hover:shadow-md sm:gap-6 sm:p-5"
      >
        <Thumb
          kind={kindFor({ name: first?.product_name, categorySlug: first?.category_slug })}
          color={first?.color_hex}
          className="size-[84px] sm:size-[104px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div>
              <p className="text-base font-bold">Pedido #{order.order_number}</p>
              <p className="text-sm text-muted">{formatOrderDate(order.created_at)}</p>
            </div>
            <StatusPill status={order.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <p className="min-w-0 text-sm text-muted">
              <span className="font-medium text-ink">{first?.product_name}</span>
              <span className="ml-3">x{first?.quantity}</span>
              {extra > 0 && <span className="ml-3">+{extra} {extra === 1 ? 'artículo más' : 'artículos más'}</span>}
            </p>
            <p className="text-base">
              <span className="text-muted">Total: </span>
              <strong className="tabular-nums">{formatPrice(order.total)}</strong>
            </p>
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  )
}

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('estado')) ? params.get('estado') : 'transit'
  const [state, setState] = useState({ status: 'loading', orders: [] })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }))
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setState(error ? { status: 'error', orders: [] } : { status: 'ready', orders: data })
  }, [])

  useEffect(() => { load() }, [load])

  const grouped = useMemo(() => {
    const g = { transit: [], delivered: [], cancelled: [] }
    state.orders.forEach((o) => g[(ORDER_STATUS[o.status] ?? ORDER_STATUS.pendiente).tab].push(o))
    return g
  }, [state.orders])

  const list = grouped[tab]
  const current = TABS.find((t) => t.key === tab)

  return (
    <section aria-labelledby="titulo-pedidos" className="mx-auto max-w-[920px] pb-6">
      <h1 id="titulo-pedidos" className="text-3xl font-bold tracking-tight sm:text-4xl">Historial de pedidos</h1>
      <p className="mt-2 text-muted">Revisa el estado de tus compras y detalles.</p>

      <div role="tablist" aria-label="Estado del pedido" className="mt-8 flex gap-8 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={t.key === tab}
            aria-controls="panel-pedidos"
            onClick={() => setParams(t.key === 'transit' ? {} : { estado: t.key }, { replace: true })}
            className={cn(
              '-mb-px border-b-2 px-1 pb-3 text-[15px] font-medium transition-colors',
              t.key === tab ? 'border-taupe text-ink' : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {t.label}
            {state.status === 'ready' && grouped[t.key].length > 0 && (
              <span className="ml-2 rounded-full bg-stone px-2 py-0.5 text-xs font-semibold text-muted">{grouped[t.key].length}</span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-pedidos" aria-labelledby={`tab-${tab}`} className="mt-6">
        {state.status === 'loading' && (
          <ul aria-busy="true" aria-label="Cargando pedidos" className="space-y-4">
            {[0, 1, 2].map((i) => <li key={i} className="h-[136px] animate-pulse rounded-[18px] bg-stone" />)}
          </ul>
        )}

        {state.status === 'error' && (
          <div role="alert" className="grid place-items-center rounded-[18px] border border-dashed border-line px-6 py-14 text-center">
            <TriangleAlert className="size-9 text-alert" aria-hidden />
            <p className="mt-3 text-lg font-semibold">No pudimos cargar tus pedidos</p>
            <p className="mt-1 text-sm text-muted">Revisa tu conexión e inténtalo de nuevo.</p>
            <Button className="mt-5" onClick={load}>Reintentar</Button>
          </div>
        )}

        {state.status === 'ready' && list.length === 0 && (
          <div className="grid place-items-center rounded-[18px] border border-dashed border-line px-6 py-14 text-center">
            <Package className="size-9 text-muted" aria-hidden />
            <p className="mt-3 text-lg font-semibold">{current.empty}</p>
            {state.orders.length === 0 && <p className="mt-1 text-sm text-muted">Cuando compres algo, lo verás aquí.</p>}
            <Button asChild className="mt-5"><Link to="/productos">Ir a la tienda</Link></Button>
          </div>
        )}

        {state.status === 'ready' && list.length > 0 && (
          <ul className="space-y-4">{list.map((o) => <OrderCard key={o.id} order={o} />)}</ul>
        )}
      </div>
    </section>
  )
}
