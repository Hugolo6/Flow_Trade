import { create } from 'zustand'
import { supabase, setRemember } from '@/lib/supabase'
import { authErrorMessage } from '@/lib/errors'
import { useCartStore } from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'

const origin = () => window.location.origin
let started = false

// Las acciones devuelven un mensaje de error en español (o undefined si todo salió bien)
export const useAuthStore = create((set, get) => ({
  ready: false,
  user: null,
  recovery: false, // true cuando la persona llega desde el enlace de "olvidé mi contraseña"

  // Se puede llamar varias veces (React StrictMode): solo arranca una vez
  init: () => {
    if (started) return
    started = true
    if (!supabase) return set({ ready: true })
    supabase.auth.getSession().then(({ data }) => set({ user: data.session?.user ?? null, ready: true }))
    supabase.auth.onAuthStateChange((event, session) => {
      set({
        user: session?.user ?? null,
        ready: true,
        recovery: event === 'PASSWORD_RECOVERY' ? true : get().recovery,
      })
    })
  },

  signIn: async (email, password, remember = true) => {
    if (!supabase) return authErrorMessage({ message: 'failed to fetch' })
    setRemember(remember)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return authErrorMessage(error)
  },

  // Si el proyecto exige confirmar el correo, no hay sesión todavía: needsConfirmation = true
  signUp: async ({ name, email, password }) => {
    if (!supabase) return { error: authErrorMessage({ message: 'failed to fetch' }) }
    setRemember(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: origin() },
    })
    if (error) return { error: authErrorMessage(error) }
    // Con confirmación de correo activa, un correo ya registrado vuelve sin identidades
    if (data.user && data.user.identities?.length === 0) {
      return { error: authErrorMessage({ message: 'User already registered' }) }
    }
    return { needsConfirmation: !data.session }
  },

  oauth: async (provider, next = '/') => {
    if (!supabase) return authErrorMessage({ message: 'failed to fetch' })
    setRemember(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${origin()}${next}` } })
    if (error) return authErrorMessage(error)
  },

  resetPassword: async (email) => {
    if (!supabase) return authErrorMessage({ message: 'failed to fetch' })
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin()}/restablecer` })
    if (error) return authErrorMessage(error)
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return authErrorMessage(error)
    set({ recovery: false })
  },

  signOut: async () => {
    await supabase?.auth.signOut()
    // En un equipo compartido no debe quedar el carrito ni los favoritos de la sesión anterior
    useCartStore.getState().clear()
    useFavoritesStore.getState().reset()
    set({ user: null, recovery: false })
  },
}))
