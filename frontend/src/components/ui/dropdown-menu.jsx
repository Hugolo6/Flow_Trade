import * as Menu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger

export function DropdownMenuContent({ className, sideOffset = 8, ...props }) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={sideOffset}
        align="end"
        className={cn('z-50 min-w-[220px] rounded-[14px] border border-line bg-white p-1.5 shadow-xl', className)}
        {...props}
      />
    </Menu.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }) {
  return (
    <Menu.Item
      className={cn('flex cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium outline-none data-[highlighted]:bg-stone', className)}
      {...props}
    />
  )
}

export const DropdownMenuLabel = ({ className, ...props }) => (
  <Menu.Label className={cn('px-3 py-2 text-[13px] text-muted', className)} {...props} />
)
export const DropdownMenuSeparator = () => <Menu.Separator className="my-1 h-px bg-line" />
