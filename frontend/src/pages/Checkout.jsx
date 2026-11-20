import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CircleCheck, Info, Lock, LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Thumb } from '@/components/Thumb'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { firstPurchaseDiscount, shippingFor } from '@/lib/pricing'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useCatalogStore } from '@/store/catalogStore'
import { selectSubtotal, useCartStore } from '@/store/cartStore'
import { useToastStore } from '@/store/toastStore'

const STEPS = ['Datos de envío', 'Pago', 'Confirmación']
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const digits = (s) => s.replace(/\D/g, '')

// ---- Validación de tarjeta (solo en el navegador; al servidor solo viajan los últimos 4 dígitos)
function luhn(number) {
  let sum = 0
  let alt = false
  for (let i = number.length - 1; i >= 0; i--) {
    let n = Number(number[i])
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}
function cardBrand(number) {
  if (/^4/.test(number)) return 'Visa'
  if (/^(5[1-5]|2(2[2-9][1-9]|[3-6]\d\d|7[01]\d|720))/.test(number)) return 'Mastercard'
  if (/^3[47]/.test(number)) return 'Amex'
  return ''
}
const formatCard = (v) => digits(v).slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
const formatExpiry = (v) => {
  const d = digits(v).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

function Stepper({ step }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label="Pasos de la compra">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = step > n
        const active = step === n
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none sm:gap-3" aria-current={active ? 'step' : undefined}>
            <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold', active || done ? 'bg-ink text-white' : 'bg-stone text-muted ring-1 ring-line')}>
              {done ? <Check className="size-4" aria-label="Completado" /> : n}
            </span>
            <span className={cn('hidden text-sm font-semibold sm:inline', !active && !done && 'text-muted')}>{label}</span>
            {n < STEPS.length && <span className={cn('h-px flex-1', done ? 'bg-ink' : 'bg-line')} aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}

function TextField({ label, error, hint, className, ...props }) {
  const uid = useId()
  return (
    <div className={className}>
      <label htmlFor={uid} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <Input id={uid} aria-invalid={Boolean(error)} aria-describedby={error ? `${uid}-e` : hint ? `${uid}-h` : undefined} className={cn(error && 'border-alert')} {...props} />
      {error ? <p id={`${uid}-e`} role="alert" className="mt-1.5 text-[13px] text-alert">{error}</p>
        : hint ? <p id={`${uid}-h`} className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </div>
  )
}

function Summary({ lines, totals, onRemove }) {
  return (
    <aside aria-label="Resumen del pedido" className="rounded-[20px] bg-white/70 p-6 ring-1 ring-line lg:sticky lg:top-28">
      <h2 className="text-lg font-bold">Resumen del pedido</h2>
      <ul className="mt-5 space-y-4">
        {lines.map((l) => (
          <li key={l.key} className="flex items-center gap-3.5">
            <Thumb kind={l.kind} color={l.color} imageUrl={l.imageUrl} className="size-[64px] p-1.5" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{l.name}{l.qty > 1 && <span className="font-medium text-muted"> ×{l.qty}</span>}</p>
              <p className="text-[13px] text-muted">{l.detail}</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums">{formatPrice(l.price * l.qty)}</p>
            </div>
            {onRemove && (
              <button onClick={() => onRemove(l.key)} aria-label={`Quitar ${l.name} del pedido`} className="grid size-8 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-stone hover:text-ink"><X className="size-4" /></button>
            )}
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-[15px]">
        <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-medium tabular-nums">{formatPrice(totals.subtotal)}</dd></div>
        {totals.discount > 0 && <div className="flex justify-between"><dt>Primera compra</dt><dd className="font-medium tabular-nums text-done">−{formatPrice(totals.discount)}</dd></div>}
        <div className="flex justify-between"><dt>Envío</dt><dd className={cn('font-semibold tabular-nums', totals.shipping === 0 && 'text-done')}>{totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping)}</dd></div>
        <div className="flex items-baseline justify-between border-t border-line pt-3.5 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(totals.total)}</dd></div>
      </dl>
      <p className="mt-5 flex items-start gap-3 rounded-[12px] bg-stone px-4 py-3 text-[13px] leading-snug text-ink/80">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span><strong className="font-semibold">Tus datos están seguros.</strong><br />Usamos tecnología de encriptación.</span>
      </p>
    </aside>
  )
}

const emptyShipping = { full_name: '', email: '', phone: '', street: '', neighborhood: '', city: '', state: '', postal_code: '' }
const emptyCard = { number: '', name: '', expiry: '', cvv: '' }

export default function Checkout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useToastStore((s) => s.show)
  const settings = useCatalogStore((s) => s.settings)
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore(selectSubtotal)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clear)

  const [step, setStep] = useState(1)
  const [shipping, setShipping] = useState({ ...emptyShipping, email: user?.email ?? '' })
  const [card, setCard] = useState(emptyCard)
  const [errors, setErrors] = useState({})
  const [payError, setPayError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [firstPurchase, setFirstPurchase] = useState(false)
  const [done, setDone] = useState(null) // pedido confirmado

  // Autocompleta con el perfil y la dirección guardada, y detecta si es la primera compra
  useEffect(() => {
    if (!supabase || !user) return
    let cancelled = false
    ;(async () => {
      const [profile, address, orders] = await Promise.all([
        supabase.from('profiles').select('full_name, phone').maybeSingle(),
        supabase.from('addresses').select('*').eq('is_default', true).limit(1).maybeSingle(),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'aprobado'),
      ])
      if (cancelled) return
      const a = address.data
      const p = profile.data
      setShipping((s) => ({
        ...s,
        full_name: s.full_name || p?.full_name || user.user_metadata?.full_name || a?.recipient || '',
        phone: s.phone || p?.phone || a?.phone || '',
        street: s.street || a?.street || '',
        neighborhood: s.neighborhood || a?.neighborhood || '',
        city: s.city || a?.city || '',
        state: s.state || a?.state || '',
        postal_code: s.postal_code || a?.postal_code || '',
      }))
      setFirstPurchase(!orders.error && orders.count === 0)
    })()
    return () => { cancelled = true }
  }, [user])

  const totals = useMemo(() => {
    if (done) return done.totals
    const discount = firstPurchase ? firstPurchaseDiscount(subtotal, settings) : 0
    const ship = shippingFor(subtotal, settings)
    return { subtotal, discount, shipping: ship, total: subtotal - discount + ship }
  }, [done, firstPurchase, subtotal, settings])

  const lines = done
    ? done.lines
    : items.map((i) => ({
        key: i.variantId, name: i.name, qty: i.qty, price: i.price, kind: i.kind, color: i.colorHex, imageUrl: i.imageUrl,
        detail: `${i.colorName}${i.size !== 'Única' ? ` / ${i.size}` : ''}`,
      }))

  const setS = (key) => (e) => setShipping((s) => ({ ...s, [key]: e.target.value }))
  const setC = (key, fmt = (v) => v) => (e) => setCard((c) => ({ ...c, [key]: fmt(e.target.value) }))

  function validateShipping() {
    const e = {}
    if (shipping.full_name.trim().length < 3) e.full_name = 'Escribe tu nombre completo.'
    if (!EMAIL_RE.test(shipping.email.trim())) e.email = 'Escribe un correo válido, por ejemplo nombre@correo.com.'
    if (digits(shipping.phone).length !== 10) e.phone = 'Escribe un teléfono de 10 dígitos, por ejemplo 442 125 4567.'
    if (!shipping.street.trim()) e.street = 'Escribe la calle y el número.'
    if (!shipping.neighborhood.trim()) e.neighborhood = 'Escribe la colonia.'
    if (!shipping.city.trim()) e.city = 'Escribe la ciudad.'
    if (!/^\d{5}$/.test(shipping.postal_code.trim())) e.postal_code = 'Escribe un código postal de 5 dígitos.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateCard() {
    const e = {}
    const num = digits(card.number)
    if (num.length < 13 || !luhn(num)) e.number = 'El número de tarjeta no es válido.'
    if (card.name.trim().length < 3) e.name = 'Escribe el nombre como aparece en la tarjeta.'
    const [mm, yy] = card.expiry.split('/')
    const month = Number(mm)
    const exp = new Date(2000 + Number(yy), month, 1) // primer día del mes siguiente
    if (!mm || !yy || yy.length !== 2 || month < 1 || month > 12 || exp <= new Date()) e.expiry = 'Revisa la fecha de vencimiento (MM/AA).'
    if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = 'El código tiene 3 o 4 dígitos.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function toPayment(ev) {
    ev.preventDefault()
    if (validateShipping()) { setErrors({}); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  async function pay(ev) {
    ev.preventDefault()
    if (busy) return
    setPayError(null)
    if (!validateCard()) return
    if (!supabase) return setPayError('No hay conexión con el servidor. Inténtalo de nuevo en un momento.')

    setBusy(true)
    const num = digits(card.number)
    const snapshot = lines
    try {
      const { data, error } = await supabase.rpc('place_order', {
        p_items: items.map((i) => ({ variant_id: i.variantId, qty: i.qty })),
        p_shipping: {
          full_name: shipping.full_name, email: shipping.email, phone: digits(shipping.phone), street: shipping.street,
          neighborhood: shipping.neighborhood, city: shipping.city, state: shipping.state, postal_code: shipping.postal_code,
        },
        p_card_last4: num.slice(-4),
        p_card_brand: cardBrand(num) || null,
      })

      if (error) {
        const m = error.message ?? ''
        if (m.includes('AUTH_REQUIRED')) return navigate('/iniciar-sesion?next=/checkout')
        if (m.includes('OUT_OF_STOCK')) return setPayError(`No hay suficiente stock de ${m.split('OUT_OF_STOCK:')[1]?.trim() ?? 'una prenda'}. Ajusta las cantidades en tu carrito.`)
        if (m.includes('INVALID_ITEM')) return setPayError('Alguna prenda de tu carrito ya no está disponible. Quítala e inténtalo de nuevo.')
        if (m.includes('INVALID_SHIPPING')) { setStep(1); return validateShipping() }
        return setPayError('No pudimos procesar el pago. No se hizo ningún cargo. Inténtalo de nuevo.')
      }
      if (data.status === 'rejected') return setPayError(data.message)

      setDone({
        order: data,
        lines: snapshot,
        totals: { subtotal: Number(data.subtotal), discount: Number(data.discount), shipping: Number(data.shipping_cost), total: Number(data.total) },
        card: `${cardBrand(num) || 'Tarjeta'} •••• ${num.slice(-4)}`,
        address: shipping,
      })
      clearCart()
      setCard(emptyCard)
      setStep(3)
      toast(`Pedido #${data.order_number} confirmado`)
      window.scrollTo({ top: 0 })
    } catch {
      setPayError('No hay conexión con el servidor. No se hizo ningún cargo. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (items.length === 0 && step !== 3) {
    return (
      <section className="grid place-items-center py-20 text-center">
        <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted">Agrega una prenda para continuar con la compra.</p>
        <Button asChild size="lg" className="mt-7"><Link to="/productos">Ver productos</Link></Button>
      </section>
    )
  }

  const brand = cardBrand(digits(card.number))

  return (
    <section aria-labelledby="titulo-checkout">
      <Stepper step={step} />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {step === 1 && (
            <form onSubmit={toPayment} noValidate>
              <h1 id="titulo-checkout" className="text-3xl font-bold tracking-tight">Paso 1. Datos de envío</h1>
              <p className="mt-2 text-muted">Ingresa la información de entrega de tu pedido.</p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <TextField className="sm:col-span-2" label="Nombre completo" value={shipping.full_name} onChange={setS('full_name')} placeholder="Ej. Juan Pérez" autoComplete="name" error={errors.full_name} />
                <TextField label="Correo electrónico" type="email" value={shipping.email} onChange={setS('email')} placeholder="tu@correo.com" autoComplete="email" error={errors.email} />
                <TextField label="Teléfono" type="tel" inputMode="tel" value={shipping.phone} onChange={setS('phone')} placeholder="Ej. 442 125 4567" autoComplete="tel-national" error={errors.phone} />
              </div>
              <h2 className="mb-4 mt-8 text-base font-bold">Dirección de envío</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField className="sm:col-span-2" label="Calle y número" value={shipping.street} onChange={setS('street')} placeholder="Ej. Av. Universidad 123" autoComplete="street-address" error={errors.street} />
                <TextField label="Colonia" value={shipping.neighborhood} onChange={setS('neighborhood')} placeholder="Ej. Centro" error={errors.neighborhood} />
                <TextField label="Ciudad" value={shipping.city} onChange={setS('city')} placeholder="Ej. San Juan del Río" autoComplete="address-level2" error={errors.city} />
                <TextField label="Código postal" inputMode="numeric" maxLength={5} value={shipping.postal_code} onChange={setS('postal_code')} placeholder="Ej. 76800" autoComplete="postal-code" error={errors.postal_code} />
                <TextField label="Estado (opcional)" value={shipping.state} onChange={setS('state')} placeholder="Ej. Querétaro" autoComplete="address-level1" />
              </div>
              <Button type="submit" size="lg" className="mt-8 w-full">Continuar al pago <ArrowRight className="size-4" aria-hidden /></Button>
              <p className="mt-4 text-center text-sm"><Link to="/carrito" className="text-muted underline underline-offset-4 hover:text-ink">Volver al carrito</Link></p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={pay} noValidate>
              <h1 id="titulo-checkout" className="text-3xl font-bold tracking-tight">Paso 2. Pago</h1>
              <p className="mt-2 text-muted">Ingresa los datos de tu tarjeta.</p>

              <div className="mt-6 flex items-start gap-3 rounded-[14px] bg-sand/60 px-4 py-3.5 text-sm ring-1 ring-line">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p><strong>Pago simulado:</strong> no se hace ningún cargo real. Usa <span className="font-mono">4242 4242 4242 4242</span> para un pago aprobado o <span className="font-mono">4000 0000 0000 0002</span> para uno rechazado. Cualquier fecha futura y CVV.</p>
              </div>

              {payError && (
                <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-[12px] bg-alert/10 px-4 py-3 text-sm text-[#9b1f1f]">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /><p>{payError}</p>
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <TextField className="sm:col-span-2" label={`Número de tarjeta${brand ? ` · ${brand}` : ''}`} inputMode="numeric" autoComplete="cc-number" value={card.number} onChange={setC('number', formatCard)} placeholder="1234 5678 9012 3456" error={errors.number} />
                <TextField className="sm:col-span-2" label="Nombre en la tarjeta" autoComplete="cc-name" value={card.name} onChange={setC('name')} placeholder="Ej. JUAN PEREZ" error={errors.name} />
                <TextField label="Vencimiento" inputMode="numeric" autoComplete="cc-exp" value={card.expiry} onChange={setC('expiry', formatExpiry)} placeholder="MM/AA" error={errors.expiry} />
                <TextField label="CVV" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvv} onChange={setC('cvv', digits)} placeholder="123" error={errors.cvv} />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-[auto_1fr]">
                <Button type="button" size="lg" variant="outline" onClick={() => { setStep(1); setPayError(null); setErrors({}) }} disabled={busy}><ArrowLeft className="size-4" aria-hidden />Volver</Button>
                <Button type="submit" size="lg" disabled={busy}>
                  {busy ? <><LoaderCircle className="size-4 animate-spin" aria-hidden />Procesando pago…</> : <>Pagar {formatPrice(totals.total)}</>}
                </Button>
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-muted"><Lock className="size-3.5" aria-hidden />Solo se guardan los últimos 4 dígitos de tu tarjeta.</p>
            </form>
          )}

          {step === 3 && done && (
            <div className="rounded-[20px] bg-white/70 p-7 ring-1 ring-line sm:p-10">
              <CircleCheck className="size-14 text-done" aria-hidden />
              <h1 id="titulo-checkout" tabIndex={-1} className="mt-5 text-3xl font-bold tracking-tight">¡Gracias por tu compra!</h1>
              <p className="mt-2 text-lg text-muted">Tu pedido <strong className="text-ink">#{done.order.order_number}</strong> fue confirmado.</p>
              <dl className="mt-8 grid gap-x-8 gap-y-5 text-[15px] sm:grid-cols-2">
                <div><dt className="text-sm text-muted">Enviar a</dt><dd className="mt-1 font-medium">{done.address.full_name}<br />{done.address.street}, {done.address.neighborhood}<br />{done.address.city}, CP {done.address.postal_code}</dd></div>
                <div><dt className="text-sm text-muted">Pago</dt><dd className="mt-1 font-medium">{done.card} (simulado)<br /><span className="font-mono text-[13px] text-muted">{done.order.payment_reference}</span></dd></div>
                <div><dt className="text-sm text-muted">Contacto</dt><dd className="mt-1 font-medium">{done.address.email}<br />{done.address.phone}</dd></div>
                <div><dt className="text-sm text-muted">Total pagado</dt><dd className="mt-1 text-xl font-bold tabular-nums">{formatPrice(done.totals.total)}</dd></div>
              </dl>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate('/pedidos')}>Ver mis pedidos</Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/')}>Seguir comprando</Button>
              </div>
            </div>
          )}
        </div>

        <Summary lines={lines} totals={totals} onRemove={step === 3 ? undefined : removeItem} />
      </div>
    </section>
  )
}
