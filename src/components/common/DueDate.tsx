import { CalendarClock } from 'lucide-react'
import { daysFromToday, formatDate, relativeDue } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

/** Prazo com destaque visual: vermelho se atrasado, âmbar se vence em até 2 dias. */
export function DueDate({ task, showIcon, className }: { task: Pick<Task, 'dueDate' | 'status'>; showIcon?: boolean; className?: string }) {
  if (!task.dueDate) return <span className={cn('text-[13px] text-subtle', className)}>Sem prazo</span>
  const diff = daysFromToday(task.dueDate)
  const done = task.status === 'concluido'
  const tone = done ? 'text-subtle' : diff < 0 ? 'text-rose-600 dark:text-rose-400' : diff <= 2 ? 'text-amber-700 dark:text-amber-400' : 'text-muted'
  return (
    <span title={formatDate(task.dueDate)} className={cn('inline-flex items-center gap-1 text-[13px] whitespace-nowrap', tone, className)}>
      {showIcon && <CalendarClock className="h-3.5 w-3.5" />}
      {!done && diff < 0 ? (diff === -1 ? 'Atrasada · ontem' : `Atrasada · ${-diff} dias`) : relativeDue(task.dueDate)}
    </span>
  )
}
