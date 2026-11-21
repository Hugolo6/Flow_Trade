import { useEffect, useId, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LoaderCircle, MailCheck, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Garment } from '@/components/Garment'
import { Logo } from '@/components/Logo'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function Field({ label, error, children, id }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] text-alert">{error}</p>}
    </div>
  )
}

function PasswordInput({ id, value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        className={cn('pr-12', error && 'border-alert')}
      />
      <button
        type="button" onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink/70 hover:bg-stone"
      >
        {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  )
}

// Panel decorativo: una barra con prendas colgadas (ilustración propia)
function RackPanel() {
  const items = [
    ['jacket', '#3E5C86', '-4deg'], ['hoodie', '#D8C3A5', '2deg'], ['tee', '#2b2b2b', '-2deg'], ['hoodie', '#7b6a58', '3deg'],
  ]
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-b from-[#e2cdb9] to-[#d3b9a1] lg:block" aria-hidden>
      <div className="absolute inset-x-0 top-[14%] flex flex-col items-center text-center">
        <Logo large className="pointer-events-none" />
        <p className="mt-4 text-sm text-ink/75">{BRAND.tagline}</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[46%]">
        <div className="absolute inset-x-6 top-5 h-[3px] rounded-full bg-ink/70" />
        <div className="absolute inset-x-8 top-5 flex justify-between">
          {items.map(([kind, color, rot], i) => (
            <div key={i} className="w-[23%] origin-top" style={{ transform: `rotate(${rot})` }}>
              <div className="mx-auto h-3 w-px bg-ink/60" />
              <Garment kind={kind} color={color} className="h-auto w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const uid = useId()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')?.startsWith('/') ? params.get('next') : '/'

  const user = useAuthStore((s) => s.user)
  const { signIn, signUp, resetPassword, oauth } = useAuthStore.getState()
  const toast = useToastStore((s) => s.show)

  const [mode, setMode] = useState('login') // login | signup | reset
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null) // { tone: 'error' | 'ok', text }
  const [busy, setBusy] = useState(false)

  useEffect(() => { setErrors({}); setMessage(null) }, [mode])

  if (user) return <Navigate to={next} replace />

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const id = (name) => `${uid}-${name}`

  function validate() {
    const e = {}
    if (mode === 'signup' && form.name.trim().length < 2) e.name = 'Escribe tu nombre completo.'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Escribe un correo válido, por ejemplo nombre@correo.com.'
    if (mode !== 'reset') {
      if (!form.password) e.password = mode === 'login' ? 'Escribe tu contraseña.' : 'Crea una contraseña.'
      else if (mode === 'signup' && form.password.length < 6) e.password = 'Usa al menos 6 caracteres.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(ev) {
    ev.preventDefault()
    setMessage(null)
    if (!validate()) return
    setBusy(true)
    const email = form.email.trim().toLowerCase()
    try {
      if (mode === 'login') {
        const error = await signIn(email, form.password, remember)
        if (error) return setMessage({ tone: 'error', text: error })
        toast('Sesión iniciada')
        navigate(next, { replace: true })
      } else if (mode === 'signup') {
        const res = await signUp({ name: form.name.trim(), email, password: form.password })
        if (res.error) return setMessage({ tone: 'error', text: res.error })
        if (res.needsConfirmation) {
          setMode('login')
          setMessage({ tone: 'ok', text: `Te enviamos un correo a ${email}. Confírmalo y luego inicia sesión.` })
        } else {
          toast('Cuenta creada')
          navigate(next, { replace: true })
        }
      } else {
        const error = await resetPassword(email)
        if (error) return setMessage({ tone: 'error', text: error })
        setMessage({ tone: 'ok', text: `Si ${email} tiene una cuenta, recibirá un enlace para crear una contraseña nueva.` })
      }
    } finally {
      setBusy(false)
    }
  }

  async function social(provider, label) {
    setMessage(null)
    const error = await oauth(provider, next)
    if (error) setMessage({ tone: 'error', text: `${label}: ${error}` })
  }

  const heading = { login: 'Bienvenido de nuevo', signup: 'Crea tu cuenta', reset: 'Recupera tu contraseña' }[mode]
  const sub = {
    login: 'Ingresa a tu cuenta para continuar.',
    signup: 'Guarda tus pedidos y compra más rápido.',
    reset: 'Escribe tu correo y te enviaremos un enlace.',
  }[mode]

  return (
    <section aria-labelledby={id('titulo')} className="mx-auto max-w-[980px]">
      <div className="grid min-h-[600px] overflow-hidden rounded-[24px] bg-white/70 ring-1 ring-line lg:grid-cols-[0.82fr_1fr]">
        <RackPanel />

        <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
          {mode !== 'reset' && (
            <div role="tablist" aria-label="Acceso" className="mb-8 grid grid-cols-2 border-b border-line text-center text-sm font-medium">
              {[['login', 'Iniciar sesión'], ['signup', 'Crear cuenta']].map(([key, label]) => (
                <button
                  key={key} role="tab" aria-selected={mode === key} onClick={() => setMode(key)}
                  className={cn('-mb-px border-b-2 py-3', mode === key ? 'border-taupe font-semibold' : 'border-transparent text-muted hover:text-ink')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <h1 id={id('titulo')} className="text-[28px] font-bold tracking-tight">{heading}</h1>
          <p className="mt-1.5 text-muted">{sub}</p>

          {message && (
            <div role={message.tone === 'error' ? 'alert' : 'status'} className={cn('mt-5 flex items-start gap-2.5 rounded-[12px] px-4 py-3 text-sm', message.tone === 'error' ? 'bg-alert/10 text-[#9b1f1f]' : 'bg-done-bg text-done')}>
              {message.tone === 'error' ? <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> : <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden />}
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {mode === 'signup' && (
              <Field id={id('name')} label="Nombre completo" error={errors.name}>
                <Input id={id('name')} value={form.name} onChange={set('name')} placeholder="Ej. Juan Pérez" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id('name')}-error` : undefined} className={cn(errors.name && 'border-alert')} />
              </Field>
            )}
            <Field id={id('email')} label="Correo electrónico" error={errors.email}>
              <Input id={id('email')} type="email" value={form.email} onChange={set('email')} placeholder="tu@correo.com" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id('email')}-error` : undefined} className={cn(errors.email && 'border-alert')} />
            </Field>
            {mode !== 'reset' && (
              <Field id={id('password')} label="Contraseña" error={errors.password}>
                <PasswordInput
                  id={id('password')} value={form.password} onChange={set('password')} error={errors.password}
                  placeholder={mode === 'login' ? 'Ingresa tu contraseña' : 'Mínimo 6 caracteres'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </Field>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-ink" />
                  Recordarme
                </label>
                <button type="button" onClick={() => setMode('reset')} className="text-taupe underline underline-offset-2 hover:text-ink">¿Olvidaste tu contraseña?</button>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {{ login: 'Iniciar sesión', signup: 'Crear cuenta', reset: 'Enviar enlace' }[mode]}
            </Button>
          </form>

          {mode === 'reset' ? (
            <button onClick={() => setMode('login')} className="mt-6 self-start text-sm font-medium underline underline-offset-4">Volver a iniciar sesión</button>
          ) : (
            <>
              <div className="my-6 flex items-center gap-3 text-[13px] text-muted"><span className="h-px flex-1 bg-line" />o continúa con<span className="h-px flex-1 bg-line" /></div>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" onClick={() => social('google', 'Google')}><span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-white" aria-hidden>G</span>Google</Button>
                <Button type="button" variant="outline" onClick={() => social('apple', 'Apple')}><span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-white" aria-hidden>A</span>Apple</Button>
              </div>
              <p className="mt-7 text-center text-sm text-muted">
                {mode === 'login' ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
                <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="font-semibold text-ink underline underline-offset-2">
                  {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-muted"><Link to="/" className="underline underline-offset-4 hover:text-ink">Volver a la tienda</Link></p>
    </section>
  )
}
