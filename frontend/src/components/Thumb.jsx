import { Garment } from '@/components/Garment'
import { cn } from '@/lib/utils'

// Miniatura de una prenda sobre fondo claro (carrito, pago e historial)
export function Thumb({ kind, color, imageUrl, className }) {
  return (
    <div className={cn('grid shrink-0 place-items-center overflow-hidden rounded-[12px] bg-stone p-2.5', className)}>
      {imageUrl
        ? <img src={imageUrl} alt="" className="size-full object-cover" />
        : <Garment kind={kind} color={color} className="h-auto w-full" />}
    </div>
  )
}
