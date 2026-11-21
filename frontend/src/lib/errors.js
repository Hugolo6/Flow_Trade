// Traduce los errores de Supabase y de place_order a mensajes claros en español
export function authErrorMessage(error) {
  const m = (error?.message ?? '').toLowerCase()
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (m.includes('email not confirmed')) return 'Confirma tu correo desde el mensaje que te enviamos y vuelve a iniciar sesión.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ya existe una cuenta con ese correo. Inicia sesión.'
  if (m.includes('at least 6')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('same as the old')) return 'La nueva contraseña debe ser distinta a la anterior.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return 'Este método de acceso aún no está habilitado. Usa tu correo y contraseña.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'
  return 'No pudimos completar la acción. Inténtalo de nuevo.'
}

export function orderErrorMessage(error) {
  const m = error?.message ?? ''
  if (m.startsWith('OUT_OF_STOCK')) {
    return `No hay suficiente stock de ${m.replace('OUT_OF_STOCK:', '').trim()}. Ajusta la cantidad en tu carrito.`
  }
  if (m.includes('AUTH_REQUIRED')) return 'Inicia sesión para continuar con tu compra.'
  if (m.includes('EMPTY_CART')) return 'Tu carrito está vacío.'
  if (m.includes('INVALID_ITEM')) return 'Un artículo de tu carrito ya no está disponible. Quítalo e inténtalo de nuevo.'
  if (m.includes('INVALID_SHIPPING')) return 'Revisa tus datos de envío: falta algún campo.'
  if (m.includes('INVALID_CARD')) return 'Revisa el número de tarjeta.'
  if (m.toLowerCase().includes('failed to fetch')) return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'
  return 'No pudimos procesar tu pedido. Inténtalo de nuevo.'
}
