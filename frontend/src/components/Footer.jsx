import { useState } from 'react'
import { Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { FacebookIcon, InstagramIcon, TiktokIcon } from '@/components/SocialIcons'
import { supabase } from '@/lib/supabase'

const COLUMNS = [
  { title: 'Comprar', links: [['Hombre', '/productos?para=hombre'], ['Mujer', '/productos?para=mujer'], ['Niños', '/productos?para=ninos'], ['Accesorios', '/productos?cat=accesorios'], ['Ofertas', '/productos?ofertas=1']] },
  { title: 'Información', links: [['Sobre nosotros'], ['Envíos'], ['Devoluciones'], ['Términos y condiciones'], ['Política de privacidad']] },
  { title: 'Ayuda', links: [['Preguntas frecuentes'], ['Guía de tallas'], ['Contacto'], ['Seguimiento de pedido', '/pedidos']] },
]
const YEAR = new Date().getFullYear()

const SOCIAL = [
  { name: 'Instagram', Icon: InstagramIcon },
  { name: 'Facebook', Icon: FacebookIcon },
  { name: 'TikTok', Icon: TiktokIcon },
]

function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({ status: 'idle', message: '' })

  async function submit(e) {
    e.preventDefault()
    setState({ status: 'sending', message: '' })
    try {
      if (!supabase) throw new Error('sin-conexion')
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() })
      if (error?.code === '23505') {
        return setState({ status: 'error', message: 'Ese correo ya está suscrito.' })
      }
      if (error?.code === '23514') {
        return setState({ status: 'error', message: 'Escribe un correo válido, por ejemplo nombre@correo.com.' })
      }
      if (error) throw error
      setEmail('')
      setState({ status: 'ok', message: 'Listo, ya estás suscrito. Revisa tu correo pronto.' })
    } catch {
      setState({ status: 'error', message: 'No pudimos suscribirte. Revisa tu conexión e inténtalo de nuevo.' })
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="newsletter" className="text-sm leading-relaxed text-white/70">
        Recibe nuestras ofertas y novedades
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="newsletter"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          autoComplete="email"
          className="h-11 min-w-0 flex-1 rounded-[10px] border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus-visible:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        />
        <button
          type="submit"
          disabled={state.status === 'sending'}
          aria-label="Suscribirme"
          className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-sand text-ink hover:bg-white disabled:opacity-60"
        >
          <Send className="size-[18px]" />
        </button>
      </div>
      <p role="status" className={`mt-2 min-h-5 text-[13px] ${state.status === 'error' ? 'text-[#ff9b9b]' : 'text-sand'}`}>
        {state.message}
      </p>
    </form>
  )
}

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.5fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-white/70">
            Ropa urbana de calidad para personas auténticas como tú.
          </p>
          <ul className="mt-5 flex gap-2.5">
            {SOCIAL.map(({ name, Icon }) => (
              <li key={name}>
                <a href="#" aria-label={name} className="grid size-10 place-items-center rounded-full border border-white/25 hover:bg-white hover:text-ink">
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-bold">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  {to
                    ? <Link to={to} className="text-sm text-white/70 hover:text-white hover:underline">{label}</Link>
                    : <span className="text-sm text-white/70">{label}</span>}
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-sm font-bold">Suscríbete</h2>
          <div className="mt-4"><Newsletter /></div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <p className="mx-auto max-w-[1320px] px-4 py-5 text-[13px] text-white/60 sm:px-6 lg:px-8">
          © {YEAR} Flow Trade. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
