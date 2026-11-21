import { BadgePercent, CircleHelp, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TopBar() {
  return (
    <div className="bg-ink text-[13px] text-white">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-1 px-4 py-2 text-center sm:grid-cols-[1fr_auto_1fr] sm:px-6 sm:text-left lg:px-8">
        <p className="hidden items-center gap-2 sm:flex"><Truck className="size-4" aria-hidden />Envío gratis en compras mayores a $999</p>
        <p className="flex items-center justify-center gap-2 font-medium"><BadgePercent className="size-4" aria-hidden />10% de descuento en tu primera compra</p>
        <nav aria-label="Atención al cliente" className="hidden justify-end gap-6 sm:flex">
          <Link to="/#ayuda" className="flex items-center gap-1.5 hover:underline"><CircleHelp className="size-4" aria-hidden />Ayuda</Link>
          <Link to="/#contacto" className="hover:underline">Contacto</Link>
        </nav>
      </div>
    </div>
  )
}
