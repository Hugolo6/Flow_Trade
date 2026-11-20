import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="grid place-items-center py-24 text-center">
      <p className="text-6xl font-extrabold tracking-tight">404</p>
      <h1 className="mt-4 text-2xl font-bold">No encontramos esta página</h1>
      <p className="mt-2 max-w-sm text-muted">Revisa la dirección o vuelve al inicio para seguir comprando.</p>
      <Button asChild className="mt-6"><Link to="/">Ir al inicio</Link></Button>
    </section>
  )
}
