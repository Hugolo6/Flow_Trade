import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ClipboardList, Heart, LogOut, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NAV_ITEMS } from '@/lib/nav'
import { useAuthStore } from '@/store/authStore'
import { useCatalogStore } from '@/store/catalogStore'
import { useCartStore, selectCount } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { useToastStore } from '@/store/toastStore'

function CounterBadge({ value, tone }) {
  if (!value) return null
  return (
    <span className={cn('absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-bold leading-[18px] text-white', tone === 'alert' ? 'bg-alert' : 'bg-ink')}>
      {value}
    </span>
  )
}

function navActive(item, location) {
  if (item.to === '/') return location.pathname === '/'
  const [path, search = ''] = item.to.split('?')
  return location.pathname === path && (search ? location.search === `?${search}` : location.search === '')
}

function SearchBox({ id, className }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const onCatalog = pathname === '/productos'
  const urlQuery = onCatalog ? params.get('q') ?? '' : ''
  const [query, setQuery] = useState(urlQuery)

  // Mantiene el campo igual a la URL al cambiar de pantalla o de filtro
  useEffect(() => { setQuery(urlQuery) }, [urlQuery])

  function change(value) {
    setQuery(value)
    const to = value.trim() ? `/productos?q=${encodeURIComponent(value)}` : '/productos'
    navigate(to, { replace: onCatalog })
  }

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">Buscar productos</label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => change(e.target.value)}
        placeholder="Buscar productos..."
        className="h-11 w-full rounded-full border border-line bg-white/70 pl-5 pr-12 text-sm placeholder:text-muted focus-visible:border-ink focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
      />
      <Search className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
    </form>
  )
}

function AccountButton() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const toast = useToastStore((s) => s.show)
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) {
    return (
      <Link
        to={`/iniciar-sesion?next=${encodeURIComponent(location.pathname + location.search)}`}
        className="flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm font-medium hover:bg-stone"
        aria-label="Mi cuenta: iniciar sesión"
      >
        <User className="size-[22px]" aria-hidden />
        <span className="hidden xl:inline">Mi cuenta</span>
      </Link>
    )
  }

  const name = user.user_metadata?.full_name || user.email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm font-medium hover:bg-stone" aria-label="Mi cuenta">
          <span className="grid size-[26px] place-items-center rounded-full bg-ink text-xs font-bold uppercase text-white">{name[0]}</span>
          <span className="hidden max-w-[120px] truncate xl:inline">{name.split(' ')[0]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate('/pedidos')}><ClipboardList className="size-4" aria-hidden />Mis pedidos</DropdownMenuItem>
        <DropdownMenuItem onSelect={async () => { await signOut(); toast('Cerraste sesión'); navigate('/') }}>
          <LogOut className="size-4" aria-hidden />Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const location = useLocation()
  const categories = useCatalogStore((s) => s.categories)
  const favCount = useFavoritesStore((s) => s.ids.length)
  const cartCount = useCartStore(selectCount)
  const openCart = useCartStore((s) => s.open)

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-7 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <button className="grid size-10 place-items-center rounded-[10px] hover:bg-stone lg:hidden" aria-label="Abrir menú"><Menu className="size-6" /></button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <SheetTitle asChild><div><Logo /></div></SheetTitle>
              <SheetClose className="grid size-9 place-items-center rounded-[10px] hover:bg-stone" aria-label="Cerrar menú"><X className="size-5" /></SheetClose>
            </div>
            <SheetDescription className="sr-only">Navegación principal y categorías</SheetDescription>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menú móvil">
              {NAV_ITEMS.map((item) => (
                <SheetClose asChild key={item.label}>
                  <Link to={item.to} className="flex w-full rounded-[10px] px-3 py-3 text-base font-semibold hover:bg-stone">{item.label}</Link>
                </SheetClose>
              ))}
              <p className="mt-5 px-3 pb-2 text-sm font-semibold text-muted">Categorías</p>
              {categories.map((c) => (
                <SheetClose asChild key={c.id}>
                  <Link to={`/productos?cat=${c.slug}`} className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] hover:bg-stone">
                    <CategoryIcon slug={c.slug} icon={c.icon} className="size-5" />{c.name}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = navActive(item, location)
            return (
              <NavLink
                key={item.label}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn('relative rounded-full px-3 py-2 text-[14.5px] font-medium transition-colors hover:bg-stone', active && 'font-semibold after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-taupe')}
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <SearchBox id="buscar" className="ml-auto hidden max-w-sm flex-1 md:block" />

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5 md:ml-0">
          <AccountButton />
          <Link to="/productos?favoritos=1" className="relative grid size-10 place-items-center rounded-[10px] hover:bg-stone" aria-label={`Favoritos, ${favCount} guardados`}>
            <Heart className="size-[22px]" /><CounterBadge value={favCount} tone="alert" />
          </Link>
          <button onClick={openCart} className="relative grid size-10 place-items-center rounded-[10px] hover:bg-stone" aria-label={`Abrir carrito, ${cartCount} artículos`}>
            <ShoppingBag className="size-[22px]" /><CounterBadge value={cartCount} />
          </button>
        </div>
      </div>

      <SearchBox id="buscar-movil" className="px-4 pb-3 md:hidden [&>svg]:right-8" />
    </header>
  )
}
