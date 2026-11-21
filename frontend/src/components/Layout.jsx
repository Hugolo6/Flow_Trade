import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { TopBar } from '@/components/TopBar'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { Toaster } from '@/components/Toaster'
import { useAuthStore } from '@/store/authStore'
import { useCatalogStore } from '@/store/catalogStore'
import { useAccountSync } from '@/hooks/useAccountSync'

function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0 })
  }, [pathname, search, hash])
  return null
}

export function Layout() {
  const init = useAuthStore((s) => s.init)
  const load = useCatalogStore((s) => s.load)
  const source = useCatalogStore((s) => s.source)
  const status = useCatalogStore((s) => s.status)
  const freeShippingFrom = useCatalogStore((s) => s.settings.free_shipping_threshold)

  useEffect(() => { init(); load() }, [init, load])
  useAccountSync()

  return (
    <>
      <ScrollToTop />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-[10px] focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Saltar al contenido
      </a>
      <TopBar />
      <Header />
      {source === 'demo' && status === 'ready' && (
        <p role="status" className="bg-sand px-4 py-2 text-center text-sm">Mostrando datos de demostración: no hay conexión con Supabase.</p>
      )}
      <main id="contenido" className="mx-auto max-w-[1320px] px-4 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer freeShippingFrom={freeShippingFrom} />
      <Toaster />
    </>
  )
}

// Protege pantallas que requieren sesión (checkout, pedidos)
export function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => s.ready)
  const location = useLocation()
  if (!ready) return <p className="py-24 text-center text-muted" role="status">Cargando…</p>
  if (!user) return <Navigate to={`/iniciar-sesion?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  return children
}
