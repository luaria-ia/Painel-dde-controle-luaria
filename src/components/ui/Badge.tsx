import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'demo'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-muted ring-line',
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/15 dark:text-emerald-300 dark:ring-emerald-400/20',
  warning: 'bg-amber-500/12 text-amber-800 ring-amber-600/20 dark:text-amber-300 dark:ring-amber-400/20',
  danger: 'bg-rose-500/10 text-rose-700 ring-rose-600/15 dark:text-rose-300 dark:ring-rose-400/20',
  info: 'bg-sky-500/10 text-sky-700 ring-sky-600/15 dark:text-sky-300 dark:ring-sky-400/20',
  accent: 'bg-accent-soft text-accent ring-accent/20',
  demo: 'bg-transparent text-subtle ring-0 border border-dashed border-line-strong',
}

interface BadgeProps {
  tone?: BadgeTone
  dot?: boolean
  children: ReactNode
  className?: string
  title?: string
}

export function Badge({ tone = 'neutral', dot, children, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium whitespace-nowrap ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  )
}

/** Selo padrão para registros de demonstração. */
export function DemoBadge() {
  return (
    <Badge tone="demo" title="Dado de exemplo — pode ser removido em Configurações">
      Exemplo
    </Badge>
  )
}
