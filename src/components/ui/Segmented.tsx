import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string; icon?: LucideIcon; count?: number }>
  className?: string
  ariaLabel?: string
}

/** Controle segmentado (abas compactas / alternância de visualização). */
export function Segmented<T extends string>({ value, onChange, options, className, ariaLabel }: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('scrollbar-thin inline-flex max-w-full overflow-x-auto rounded-lg border border-line bg-surface-2 p-0.5', className)}
    >
      {options.map((o) => {
        const active = o.value === value
        const Icon = o.icon
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors',
              active ? 'bg-surface text-fg shadow-card ring-1 ring-line' : 'text-muted hover:text-fg',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {o.label}
            {o.count !== undefined && (
              <span className={cn('tabular text-[11px]', active ? 'text-muted' : 'text-subtle')}>{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
