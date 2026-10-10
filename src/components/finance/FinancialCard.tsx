import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'positive' | 'negative' | 'warning'

const iconTone: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted',
  positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  negative: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  warning: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
}

interface Props {
  label: string
  cents: number
  icon: LucideIcon
  tone?: Tone
  hint?: ReactNode
  /** Colore o valor de vermelho se negativo. */
  signed?: boolean
}

export function FinancialCard({ label, cents, icon: Icon, tone = 'neutral', hint, signed }: Props) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', iconTone[tone])}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
      </div>
      <p
        className={cn(
          'tabular mt-3 text-xl font-semibold tracking-tight sm:text-[22px]',
          cents === 0 && 'text-subtle',
          signed && cents < 0 && 'text-rose-600 dark:text-rose-400',
        )}
      >
        {formatCurrency(cents)}
      </p>
      {hint && <p className="mt-1 text-[12px] text-subtle">{hint}</p>}
    </div>
  )
}
