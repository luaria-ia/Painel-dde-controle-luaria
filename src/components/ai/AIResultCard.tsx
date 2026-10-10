import type { ReactNode } from 'react'
import { AlertCircle, Bot, FlaskConical, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { AIResult } from '@/services/ai/types'
import { Markdown } from './Markdown'

/** Selo que diferencia resposta real de IA de demonstração (nunca finge ser IA). */
export function AISourceBadge({ result }: { result: AIResult }) {
  if (result.source === 'ai') {
    const served = result.servedBy
    const name = served ? (served.provider === 'anthropic' ? 'Claude' : `Gemini ${served.tier === 'paid' ? 'Paid' : 'Free'}`) : 'IA'
    const title = served
      ? `Respondido por ${served.label}${result.model ? ` (${result.model})` : ''}${served.fallback ? ' — uma opção anterior estava indisponível' : ''}`
      : result.model
    return (
      <span
        title={title}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
          served?.tier === 'paid' ? 'bg-amber-500/12 text-amber-700 dark:text-amber-300' : 'bg-accent-soft text-accent',
        )}
      >
        <Bot className="h-3 w-3" /> {name}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-line-strong px-1.5 py-0.5 text-[11px] font-medium text-subtle">
      <FlaskConical className="h-3 w-3" /> Demonstração
    </span>
  )
}

export function AILoading({ label = 'Analisando o contexto…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-3 text-[13px] text-muted" role="status">
      <span className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent">
          <Bot className="h-2.5 w-2.5 text-accent-fg" />
        </span>
      </span>
      {label}
    </div>
  )
}

export function AIErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-[13px] text-rose-700 sm:flex-row sm:items-center sm:justify-between dark:text-rose-300">
      <span className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {message}
      </span>
      {onRetry && (
        <Button size="sm" icon={RotateCcw} onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}

/** Mostra o resultado de uma geração com selo de origem, aviso e ações opcionais. */
export function AIResultCard({ result, actions, className }: { result: AIResult; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <AISourceBadge result={result} />
        {result.notice && <span className="text-[12px] text-subtle">{result.notice}</span>}
      </div>
      <Markdown text={result.text} />
      {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
    </div>
  )
}
