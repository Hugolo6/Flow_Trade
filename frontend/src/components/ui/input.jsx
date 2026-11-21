import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'h-11 w-full rounded-[10px] border border-line bg-white px-4 text-sm text-ink placeholder:text-muted',
        'focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15',
        className,
      )}
      {...props}
    />
  )
}
