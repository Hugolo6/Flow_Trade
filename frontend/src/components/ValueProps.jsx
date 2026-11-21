import { Gem, Headphones, Lock, Tag } from 'lucide-react'

const ITEMS = [
  { icon: Gem, title: 'Calidad Premium', text: 'Productos de alta calidad' },
  { icon: Tag, title: 'Mejores precios', text: 'Precios justos siempre' },
  { icon: Headphones, title: 'Atención 24/7', text: 'Te ayudamos siempre' },
  { icon: Lock, title: 'Pago 100% seguro', text: 'Compra con confianza' },
]

export function ValueProps() {
  return (
    <section aria-label="Por qué comprar con nosotros" className="mt-8">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 px-2 py-4 lg:grid-cols-4 lg:px-6">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/80 ring-1 ring-line">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">{title}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
