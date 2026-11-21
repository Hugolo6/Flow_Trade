import { Check } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export function Toaster() {
  const message = useToastStore((s) => s.message)
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      {message && (
        <div className="toast pointer-events-auto flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-xl">
          <Check className="size-4 text-sand" aria-hidden />
          {message}
        </div>
      )}
    </div>
  )
}
