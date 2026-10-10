import { Pencil, Trash2 } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { DueDate } from '@/components/common/DueDate'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Field'
import { Menu } from '@/components/ui/Menu'
import { TASK_PRIORITY, TASK_STATUS, TASK_STATUS_ORDER } from '@/config/labels'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types'
import { TaskCheckbox } from './TaskCheckbox'

interface Props {
  task: Task
  onOpen: () => void
  onToggle: () => void
  onStatusChange: (status: TaskStatus) => void
  onDelete: () => void
}

/** Cartão de tarefa do Kanban (o arraste é feito pelo KanbanBoard; no toque, o seletor de status move o cartão). */
export function TaskCard({ task, onOpen, onToggle, onStatusChange, onDelete }: Props) {
  const done = task.status === 'concluido'
  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer rounded-lg border border-line bg-surface p-3 shadow-card transition-all hover:border-line-strong"
    >
      <div className="flex items-start gap-2.5">
        <div className="pt-px">
          <TaskCheckbox task={task} onToggle={onToggle} />
        </div>
        <p className={cn('min-w-0 flex-1 text-[13.5px] leading-snug font-medium', done && 'text-subtle line-through')}>{task.title}</p>
        <div className="-mt-1 -mr-1.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          <Menu
            items={[
              { label: 'Editar', icon: Pencil, onSelect: onOpen },
              { label: 'Excluir', icon: Trash2, danger: true, onSelect: onDelete },
            ]}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1 pl-7">
        {task.projectId && <ProjectLink id={task.projectId} />}
        {task.clientId && <ClientLink id={task.clientId} className="text-[12px]" />}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pl-7">
        <div className="flex items-center gap-1.5">
          <Badge tone={TASK_PRIORITY[task.priority].tone}>{TASK_PRIORITY[task.priority].label}</Badge>
          {task.isDemo && <DemoBadge />}
        </div>
        <DueDate task={task} className="text-[12px]" />
      </div>

      {/* Mover sem arrastar (toque / teclado) */}
      <div className="mt-2.5 pl-7 lg:hidden" onClick={(e) => e.stopPropagation()}>
        <Select
          compact
          aria-label="Mover para"
          value={task.status}
          options={TASK_STATUS_ORDER.map((s) => ({ value: s, label: TASK_STATUS[s].label }))}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
        />
      </div>
    </article>
  )
}
