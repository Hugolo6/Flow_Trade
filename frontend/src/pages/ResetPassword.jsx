import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoaderCircle, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

// Destino del enlace "Olvidé mi contraseña": Supabase abre una sesión temporal y aquí se elige la nueva.
export default function ResetPassword() {
  const uid = useId()
  const navigate = useNavigate()
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const toast = useToastStore((s) => s.show)
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!ready) return <p className="py-24 text-center text-muted" role="status">Cargando…</p>

  if (!user) {
    return (
      <section className="mx-auto max-w-[460px] rounded-[20px] bg-card p-8 text-center ring-1 ring-line">
        <TriangleAlert className="mx-auto size-9 text-muted" aria-hidden />
        <h1 className="mt-3 text-xl font-bold">Este enlace ya no es válido</h1>
        <p className="mt-1 text-sm text-muted">Los enlaces para cambiar la contraseña vencen. Pide uno nuevo desde el inicio de sesión.</p>
        <Button asChild className="mt-6"><Link to="/iniciar-sesion">Ir a iniciar sesión</Link></Button>
      </section>
    )
  }

  async function submit(e) {
    e.preventDefault()
    if (form.password.length < 6) return setError('Usa al menos 6 caracteres.')
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.')
    setError('')
    setBusy(true)
    const message = await useAuthStore.getState().updatePassword(form.password)
    setBusy(false)
    if (message) return setError(message)
    toast('Contraseña actualizada')
    navigate('/', { replace: true })
  }

  return (
    <section aria-labelledby={`${uid}-t`} className="mx-auto max-w-[460px] rounded-[20px] bg-card p-8 ring-1 ring-line">
      <h1 id={`${uid}-t`} className="text-2xl font-bold">Crea tu nueva contraseña</h1>
      <p className="mt-1 text-sm text-muted">Úsala la próxima vez que inicies sesión.</p>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {[['password', 'Nueva contraseña'], ['confirm', 'Repite la contraseña']].map(([key, label]) => (
          <div key={key}>
            <label htmlFor={`${uid}-${key}`} className="mb-1.5 block text-sm font-medium">{label}</label>
            <Input id={`${uid}-${key}`} type="password" autoComplete="new-password" value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
        {error && <p role="alert" className="text-sm text-alert">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />} Guardar contraseña
        </Button>
      </form>
    </section>
  )
}
