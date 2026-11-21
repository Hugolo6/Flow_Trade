import { Shirt, Watch } from 'lucide-react'

// Iconos lineales por categoría. Lucide no trae sudadera, pantalón, chamarra, zapato ni gorra
// con el estilo del diseño, así que esos se dibujan con el mismo trazo (24px, 1.7).
const base = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

const Hoodie = (p) => (
  <svg {...base} {...p}>
    <path d="M9 3.5c.4 1.6 1.5 2.6 3 2.6s2.6-1 3-2.6l4.5 1.8L22 11l-3 1.2V21H5v-8.8L2 11l2.5-5.7z" />
    <path d="M9 3.5C9.2 8 10.6 9.5 12 9.5s2.8-1.5 3-6" />
    <path d="M8.5 16h7l.8 3H7.7z" />
  </svg>
)
const Pants = (p) => (
  <svg {...base} {...p}>
    <path d="M7 3h10l1.2 18h-4.4L12 9.5 10.2 21H5.8z" />
    <path d="M7 7h10" />
  </svg>
)
const Jacket = (p) => (
  <svg {...base} {...p}>
    <path d="M8 3 3 6l-1 7h3v8h14v-8h3l-1-7-5-3" />
    <path d="m8 3 4 4 4-4" />
    <path d="M12 7v14" />
  </svg>
)
const Shoe = (p) => (
  <svg {...base} {...p}>
    <path d="M3 17.5V8c0-.6.5-1 1-.8l3.6 1.6c.7.3 1.4.2 2-.3l1.2-1.1 1.7 1.8c.8.8 1.8 1.4 2.9 1.7l2.6.8c1 .3 1.8 1.2 2 2.3v4" />
    <path d="M3 17.5h18V20H3z" />
    <path d="m10.5 9.5 1.3 1.3" />
  </svg>
)
const Cap = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 15C4.5 9.5 8 6 12.5 6S20 9.5 20 15" />
    <path d="M3 15h18.5c0 1.2-.9 2-2.2 2H3z" />
    <path d="M12.5 6c-1.2 2.5-1.4 5.5-1 9" />
  </svg>
)

const byIcon = { shirt: Shirt, watch: Watch }
const bySlug = {
  playeras: Shirt, sudaderas: Hoodie, pantalones: Pants, chamarras: Jacket,
  calzado: Shoe, gorras: Cap, accesorios: Watch,
}

export function CategoryIcon({ slug, icon, className }) {
  const Icon = bySlug[slug] ?? byIcon[icon] ?? Shirt
  return <Icon className={className} />
}
