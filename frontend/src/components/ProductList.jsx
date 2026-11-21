import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { cn } from '@/lib/utils'

export function ProductList({ products, loading, wide = false, emptyTitle = 'No encontramos productos', emptyText = 'Prueba con otra palabra o vuelve a ver todo el catálogo.' }) {
  const cols = wide ? 'sm:grid-cols-3 xl:grid-cols-5' : 'xl:grid-cols-4'

  if (loading) {
    return (
      <ul className={cn('grid grid-cols-2 gap-x-4 gap-y-8', cols)} aria-busy="true" aria-label="Cargando productos">
        {Array.from({ length: wide ? 5 : 4 }).map((_, i) => (
          <li key={i}>
            <div className="aspect-[4/5] animate-pulse rounded-[18px] bg-stone" />
            <div className="mt-3.5 h-4 w-2/3 animate-pulse rounded bg-stone" />
            <div className="mt-2.5 h-4 w-1/3 animate-pulse rounded bg-stone" />
          </li>
        ))}
      </ul>
    )
  }

  if (products.length === 0) {
    return (
      <div className="grid place-items-center rounded-[18px] border border-dashed border-line px-6 py-16 text-center">
        <SearchX className="size-9 text-muted" aria-hidden />
        <p className="mt-3 text-lg font-semibold">{emptyTitle}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">{emptyText}</p>
        <Button asChild className="mt-5"><Link to="/productos">Ver todos los productos</Link></Button>
      </div>
    )
  }

  return (
    <ul className={cn('grid grid-cols-2 gap-x-4 gap-y-9', cols)}>
      {products.map((p) => <li key={p.id} className="h-full"><ProductCard product={p} /></li>)}
    </ul>
  )
}
