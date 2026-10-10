import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

/** Checkbox circular para concluir/reabrir uma tarefa. */
export function TaskCheckbox({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const done = task.status === 'concluido'
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-colors',
        done
          ? 'border-accent bg-accent text-accent-fg'
          : task.status === 'em_andamento'
            ? 'border-sky-500 hover:bg-sky-500/10'
            : 'border-line-strong hover:border-accent hover:bg-accent-soft',
      )}
    >
      {done && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  )
}
