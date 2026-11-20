// Luminancia aproximada para elegir un tono de detalle que se vea sobre cualquier color de prenda
export function luminance(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export function detailTone(hex) {
  return luminance(hex) < 0.28
    ? `color-mix(in srgb, ${hex} 70%, #ffffff)`
    : `color-mix(in srgb, ${hex} 78%, #000000)`
}
