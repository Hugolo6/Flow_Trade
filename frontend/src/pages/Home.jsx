import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Hero } from '@/components/Hero'
import { ValueProps } from '@/components/ValueProps'
import { ProductList } from '@/components/ProductList'
import { useCatalog } from '@/store/catalogStore'

export default function Home() {
  const { products, banners, loading } = useCatalog()
  const featured = products.filter((p) => p.is_featured)
  const list = featured.length ? featured : products

  return (
    <>
      <Hero banners={banners} />
      <ValueProps />
      <section aria-labelledby="destacados" className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="destacados" className="text-2xl font-bold tracking-tight sm:text-[28px]">Productos destacados</h2>
          <Link to="/productos" className="flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:text-muted">
            Ver todos <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ProductList products={list.slice(0, 5)} loading={loading} wide />
      </section>
      <section className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white/70 px-6 py-6 ring-1 ring-line sm:px-8">
        <div>
          <h2 className="text-xl font-bold">Compra por categoría</h2>
          <p className="mt-1 text-muted">Encuentra tu estilo en cada categoría.</p>
        </div>
        <Link to="/categorias" className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft">
          Explorar categorías <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </>
  )
}
