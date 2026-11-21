import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

// "Recordarme": si la persona lo desmarca, la sesión vive solo en esta pestaña (sessionStorage).
const REMEMBER_KEY = 'flowtrade-remember'
const safe = (fn, fallback = null) => { try { return fn() } catch { return fallback } }

const storage = {
  getItem: (k) => safe(() => localStorage.getItem(k) ?? sessionStorage.getItem(k)),
  setItem: (k, v) => safe(() => (localStorage.getItem(REMEMBER_KEY) === '0' ? sessionStorage : localStorage).setItem(k, v)),
  removeItem: (k) => safe(() => { localStorage.removeItem(k); sessionStorage.removeItem(k) }),
}

export function setRemember(remember) {
  safe(() => localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0'))
}

// Solo clave pública (anon/publishable). La service_role va únicamente en el backend.
export const supabase = supabaseConfigured
  ? createClient(url, anonKey, { auth: { storage } })
  : null
