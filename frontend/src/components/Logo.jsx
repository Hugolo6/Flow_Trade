import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({ className, light = false, large = false }) {
  return (
    <Link
      to="/"
      aria-label="Flow Trade, ir al inicio"
      className={cn('inline-flex flex-col items-center leading-none', light ? 'text-white' : 'text-ink', className)}
    >
      <span className={cn('font-extrabold tracking-[0.14em]', large ? 'text-[44px]' : 'text-[25px]')}>FLOW</span>
      <span className={cn('pl-[0.5em] font-medium tracking-[0.5em]', large ? 'mt-1.5 text-[15px]' : 'mt-1 text-[9px]')}>TRADE</span>
    </Link>
  )
}
