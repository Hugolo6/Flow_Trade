// Mismas reglas que aplica place_order en la base de datos (aquí solo para mostrar el resumen)
export const shippingFor = (subtotal, settings) =>
  subtotal >= settings.free_shipping_threshold ? 0 : settings.shipping_cost

export const firstPurchaseDiscount = (subtotal, settings) =>
  Math.round(subtotal * (settings.first_purchase_discount_percent ?? 10)) / 100
