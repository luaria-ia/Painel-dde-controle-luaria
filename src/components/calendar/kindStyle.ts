import { CalendarClock, CheckSquare, Megaphone, type LucideIcon } from 'lucide-react'
import type { AgendaKind } from '@/lib/selectors'

/** Identidade visual de cada tipo no calendário. */
export const KIND_STYLE: Record<AgendaKind, { label: string; icon: LucideIcon; chip: string; text: string }> = {
  task: { label: 'Tarefa', icon: CheckSquare, chip: 'border-l-emerald-500 bg-emerald-500/8', text: 'text-emerald-600 dark:text-emerald-400' },
  event: { label: 'Evento', icon: CalendarClock, chip: 'border-l-sky-500 bg-sky-500/8', text: 'text-sky-600 dark:text-sky-400' },
  content: { label: 'Conteúdo', icon: Megaphone, chip: 'border-l-violet-500 bg-violet-500/8', text: 'text-violet-600 dark:text-violet-400' },
}
