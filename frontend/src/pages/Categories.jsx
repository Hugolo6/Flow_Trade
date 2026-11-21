import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Baby, BadgePercent, LayoutGrid, PersonStanding, Shirt, ShoppingBag } from 'lucide-react'
import { Garment, kindFor } from '@/components/Garment'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { useCatalog } from '@/store/catalogStore'

const FILTERS = [
  { id: 'all', label: 'Todas las categorías', icon: LayoutGrid },
  { id: 'hombre', label: 'Hombre', icon: Shirt },
  { id: 'mujer', label: 'Mujer', icon: PersonStanding },
  { id: 'ninos', label: 'Niños', icon: Baby },
  { id: 'accesorios', label: 'Accesorios', icon: ShoppingBag },
  { id: 'ofertas', label: 'Ofertas', icon: BadgePercent },
]

const matches = (p, filter) => {
  if (filter === 'all') return true
  if (filter === 'accesorios') return p.categories?.slug === 'accesorios'
  if (filter === 'ofertas') return p.compare_at_price && p.compare_at_price > p.price
  return p.audience === filter || p.audience === 'unisex'
}

export default function Categories() {
  const { categories, products, loading } = useCatalog()
  const [filter, setFilter] = useState('all')

  const cards = useMemo(() => {
    return categories
      .map((c) => {
        const list = products.filter((p) => p.categories?.slug === c.slug && matches(p, filter))
        if (!list.length) return null
        const cheapest = [...list].sort((a, b) => a.price - b.price)[0]
        const params = new URLSearchParams({ cat: c.slug })
        if (['hombre', 'mujer', 'ninos'].includes(filter)) params.set('para', filter)
        if (filter === 'ofertas') params.set('ofertas', '1')
        return { category: c, product: cheapest, count: list.length, min: cheapest.price, to: `/productos?${params}` }
      })
      .filter(Boolean)
  }, [categories, products, filter])

  const hoodie = products.find((p) => p.slug === 'sudadera-oversize')

  return (
    <section aria-labelledby="titulo-categorias">
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,560px)]">
        <div>
          <h1 id="titulo-categorias" className="text-4xl font-bold tracking-tight sm:text-[44px] sm:leading-[1.1]">Venta por categoría</h1>
          <p className="mt-3 text-lg text-muted">Encuentra tu estilo en cada categoría.</p>
        </div>
        <Link
          to="/productos?nuevos=1"
          className="group flex items-center overflow-hidden rounded-[20px] bg-gradient-to-r from-[#d7c0aa] to-[#efe3d6] ring-1 ring-line"
        >
          <div className="w-[34%] shrink-0 self-end px-3 pt-4">
            <Garment kind="hoodie" color={hoodie?.product_variants?.[0]?.color_hex ?? '#3b3b3e'} className="h-auto w-full" />
          </div>
          <div className="flex flex-1 items-center justify-between gap-4 py-6 pr-6">
            <div>
              <p className="text-xl font-bold">Nuevos lanzamientos</p>
              <p className="mt-1 text-sm text-ink/70">Sé el primero en llevar lo último</p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-taupe text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-5" aria-hidden />
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav aria-label="Filtrar categorías" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={cn('flex shrink-0 items-center gap-3 rounded-[12px] px-4 py-3 text-left text-[15px] font-medium transition-colors', filter === id ? 'bg-sand font-semibold' : 'hover:bg-stone')}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        {loading ? (
          <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4" aria-busy="true" aria-label="Cargando categorías">
            {Array.from({ length: 8 }).map((_, i) => <li key={i} className="aspect-[4/4.6] animate-pulse rounded-[18px] bg-stone" />)}
          </ul>
        ) : cards.length === 0 ? (
          <p className="rounded-[18px] border border-dashed border-line px-6 py-16 text-center text-muted">No hay categorías con productos para este filtro.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {cards.map(({ category, product, count, min, to }) => (
              <li key={category.id}>
                <Link to={to} className="group block overflow-hidden rounded-[18px] bg-white/70 ring-1 ring-line transition-shadow hover:shadow-md">
                  <div className="grid aspect-[4/3.4] place-items-center bg-stone p-[16%]">
                    <Garment
                      kind={kindFor({ name: product.name, categorySlug: category.slug })}
                      color={product.product_variants?.[0]?.color_hex}
                      className="h-auto w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                    <div>
                      <p className="text-[15px] font-semibold">{category.name}</p>
                      <p className="mt-0.5 text-sm text-muted tabular-nums">{formatPrice(min)}{count > 1 && '+'}</p>
                    </div>
                    <ArrowRight className="size-[18px] shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
