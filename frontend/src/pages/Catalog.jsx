import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductList } from '@/components/ProductList'
import { cn } from '@/lib/utils'
import { AUDIENCES } from '@/lib/nav'
import { useCatalog } from '@/store/catalogStore'
import { useFavoritesStore } from '@/store/favoritesStore'

const normalize = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors', active ? 'border-ink bg-ink text-white' : 'border-line bg-white/70 hover:bg-stone')}
    >
      {children}
    </button>
  )
}

export default function Catalog() {
  const { products, categories, loading } = useCatalog()
  const favoriteIds = useFavoritesStore((s) => s.ids)
  const [params, setParams] = useSearchParams()

  const q = (params.get('q') ?? '').trim()
  const cat = params.get('cat')
  const para = params.get('para')
  const offers = params.get('ofertas') === '1'
  const news = params.get('nuevos') === '1'
  const favorites = params.get('favoritos') === '1'

  const { title, items, emptyTitle, emptyText } = useMemo(() => {
    let list = products
    let emptyTitle
    let emptyText
    if (q) {
      const n = normalize(q)
      list = list.filter((p) => normalize(`${p.name} ${p.description ?? ''}`).includes(n))
    }
    if (favorites) {
      list = list.filter((p) => favoriteIds.includes(p.id))
      emptyTitle = 'Aún no tienes favoritos'
      emptyText = 'Toca el corazón de una prenda para guardarla aquí.'
    }
    if (cat) list = list.filter((p) => p.categories?.slug === cat)
    if (para) list = list.filter((p) => p.audience === para || p.audience === 'unisex')
    if (offers) {
      list = list.filter((p) => p.compare_at_price && p.compare_at_price > p.price)
      emptyTitle = 'Por ahora no hay ofertas'
      emptyText = 'Cuando haya precios rebajados aparecerán aquí.'
    }
    if (news) list = [...list].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 8)

    const catName = categories.find((c) => c.slug === cat)?.name
    const audName = AUDIENCES.find((a) => a.value === para)?.label
    let title = 'Todos los productos'
    if (q) title = `Resultados para “${q}”`
    else if (favorites) title = 'Tus favoritos'
    else if (news) title = 'Nuevos lanzamientos'
    else if (offers) title = 'Ofertas'
    else if (catName || audName) title = [catName, audName].filter(Boolean).join(' · ')
    return { title, items: list, emptyTitle, emptyText }
  }, [products, categories, favoriteIds, q, cat, para, offers, news, favorites])

  function setParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('favoritos')
    next.delete('ofertas')
    next.delete('nuevos')
    setParams(next)
  }

  return (
    <section aria-labelledby="titulo-catalogo">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 id="titulo-catalogo" className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {!loading && <p className="text-sm text-muted" role="status">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>}
      </div>

      {!favorites && (
        <div className="mt-5 space-y-3">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Categorías">
            <Chip active={!cat} onClick={() => setParam('cat', null)}>Todas</Chip>
            {categories.map((c) => <Chip key={c.id} active={cat === c.slug} onClick={() => setParam('cat', c.slug)}>{c.name}</Chip>)}
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Para quién">
            <Chip active={!para} onClick={() => setParam('para', null)}>Para todos</Chip>
            {AUDIENCES.map((a) => <Chip key={a.value} active={para === a.value} onClick={() => setParam('para', a.value)}>{a.label}</Chip>)}
          </div>
        </div>
      )}

      <div className="mt-8">
        <ProductList products={items} loading={loading} emptyTitle={emptyTitle} emptyText={emptyText} />
      </div>
    </section>
  )
}
