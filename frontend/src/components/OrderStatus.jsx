import { cn } from '@/lib/utils'

// El historial agrupa los estados de la base de datos en tres pestañas
export const ORDER_STATUS = {
  pendiente: { label: 'Pendiente', tab: 'transit', tone: 'bg-transit-bg text-transit' },
  pagado: { label: 'En tránsito', tab: 'transit', tone: 'bg-transit-bg text-transit' },
  enviado: { label: 'En tránsito', tab: 'transit', tone: 'bg-transit-bg text-transit' },
  entregado: { label: 'Entregado', tab: 'delivered', tone: 'bg-done-bg text-done' },
  cancelado: { label: 'Cancelado', tab: 'cancelled', tone: 'bg-cancel-bg text-cancel' },
  fallido: { label: 'Fallido', tab: 'cancelled', tone: 'bg-cancel-bg text-cancel' },
}

export function StatusPill({ status, className }) {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.pendiente
  return (
    <span className={cn('inline-block rounded-full px-3.5 py-1 text-[13px] font-semibold', s.tone, className)}>
      {s.label}
    </span>
  )
}

export const formatOrderDate = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
