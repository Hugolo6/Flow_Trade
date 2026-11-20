import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

export const Sheet = Dialog.Root
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close
export const SheetTitle = Dialog.Title
export const SheetDescription = Dialog.Description

export function SheetContent({ side = 'right', className, children, ...props }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="sheet-overlay fixed inset-0 z-40 bg-ink/45" />
      <Dialog.Content
        className={cn(
          'fixed inset-y-0 z-50 flex w-full max-w-[420px] flex-col bg-white shadow-2xl outline-none',
          side === 'right' ? 'sheet-right right-0' : 'sheet-left left-0',
          className,
        )}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}
