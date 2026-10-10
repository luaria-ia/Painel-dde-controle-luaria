import { useState } from 'react'
import { ListChecks, Pencil, Trash2 } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { DueDate } from '@/components/common/DueDate'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Field'
import { Menu } from '@/components/ui/Menu'
import { TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table'
import { TASK_PRIORITY, TASK_STATUS, TASK_STATUS_ORDER } from '@/config/labels'
import { useTaskActions } from '@/hooks/useTaskActions'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types'
import { TaskCheckbox } from './TaskCheckbox'
import { TaskFormModal } from './TaskFormModal'

interface Props {
  tasks: Task[]
  showProject?: boolean
  showClient?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}

const statusOptions = TASK_STATUS_ORDER.map((s) => ({ value: s, label: TASK_STATUS[s].label }))

/** Lista de tarefas: tabela no desktop, cartões compactos no celular. Edição e exclusão embutidas. */
export function TaskList({ tasks, showProject = true, showClient = true, emptyTitle, emptyDescription, emptyAction }: Props) {
  const actions = useTaskActions()
  const [editing, setEditing] = useState<Task | null>(null)

  if (tasks.length === 0) {
    return (
      <EmptyState
        compact
        icon={ListChecks}
        title={emptyTitle ?? 'Nenhuma tarefa por aqui'}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  const menu = (t: Task) => (
    <Menu
      items={[
        { label: 'Editar', icon: Pencil, onSelect: () => setEditing(t) },
        { label: 'Excluir', icon: Trash2, danger: true, onSelect: () => actions.remove(t) },
      ]}
    />
  )

  return (
    <div className="@container">
      {/* Desktop */}
      <div className="hidden @3xl:block">
        <Table>
          <THead>
            <tr>
              <Th>Tarefa</Th>
              {showProject && <Th className="w-40">Projeto</Th>}
              {showClient && <Th className="w-40">Cliente</Th>}
              <Th className="w-40">Status</Th>
              <Th className="w-24">Prioridade</Th>
              <Th className="w-36">Prazo</Th>
              <Th className="w-10" aria-label="Ações" />
            </tr>
          </THead>
          <TBody>
            {tasks.map((t) => (
              <Tr key={t.id} className="cursor-pointer" onClick={() => setEditing(t)}>
                <Td>
                  <div className="flex min-w-0 items-center gap-3">
                    <TaskCheckbox task={t} onToggle={() => actions.toggleDone(t)} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('truncate font-medium', t.status === 'concluido' && 'text-subtle line-through')}>{t.title}</span>
                        {t.isDemo && <DemoBadge />}
                      </div>
                      {t.description && <p className="truncate text-[12px] text-subtle">{t.description}</p>}
                    </div>
                  </div>
                </Td>
                {showProject && (
                  <Td className="max-w-40">
                    <ProjectLink id={t.projectId} />
                  </Td>
                )}
                {showClient && (
                  <Td className="max-w-40">
                    <ClientLink id={t.clientId} />
                  </Td>
                )}
                <Td onClick={(e) => e.stopPropagation()}>
                  <Select
                    compact
                    aria-label="Status"
                    value={t.status}
                    options={statusOptions}
                    onChange={(e) => actions.changeStatus(t, e.target.value as TaskStatus)}
                  />
                </Td>
                <Td>
                  <Badge tone={TASK_PRIORITY[t.priority].tone}>{TASK_PRIORITY[t.priority].label}</Badge>
                </Td>
                <Td>
                  <DueDate task={t} />
                </Td>
                <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                  {menu(t)}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-line border-t border-line @3xl:hidden">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-start gap-3 px-4 py-3" onClick={() => setEditing(t)}>
            <div className="pt-0.5">
              <TaskCheckbox task={t} onToggle={() => actions.toggleDone(t)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-medium', t.status === 'concluido' && 'text-subtle line-through')}>{t.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {showProject && t.projectId && <ProjectLink id={t.projectId} />}
                {showClient && t.clientId && <ClientLink id={t.clientId} />}
                <DueDate task={t} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge tone={TASK_STATUS[t.status].tone}>{TASK_STATUS[t.status].label}</Badge>
                <Badge tone={TASK_PRIORITY[t.priority].tone}>{TASK_PRIORITY[t.priority].label}</Badge>
                {t.isDemo && <DemoBadge />}
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>{menu(t)}</div>
          </li>
        ))}
      </ul>

      <TaskFormModal open={!!editing} task={editing} onClose={() => setEditing(null)} />
    </div>
  )
}
