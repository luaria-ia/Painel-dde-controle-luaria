import { useState } from 'react'
import { KanbanBoard, type KanbanColumn } from '@/components/ui/KanbanBoard'
import { TASK_STATUS, TASK_STATUS_ORDER } from '@/config/labels'
import { useTaskActions } from '@/hooks/useTaskActions'
import { sortByDue } from '@/lib/selectors'
import type { Task, TaskStatus } from '@/types'
import { TaskCard } from './TaskCard'
import { TaskFormModal, type TaskDefaults } from './TaskFormModal'

const columnDot: Record<TaskStatus, string> = {
  a_fazer: 'bg-subtle',
  em_andamento: 'bg-sky-500',
  concluido: 'bg-emerald-500',
}

const COLUMNS: KanbanColumn<TaskStatus>[] = TASK_STATUS_ORDER.map((s) => ({ id: s, label: TASK_STATUS[s].label, dot: columnDot[s] }))

/** Kanban de tarefas (usa o KanbanBoard genérico). */
export function TaskKanban({ tasks, defaults }: { tasks: Task[]; defaults?: TaskDefaults }) {
  const actions = useTaskActions()
  const [editing, setEditing] = useState<Task | null>(null)
  const [creatingIn, setCreatingIn] = useState<TaskStatus | null>(null)

  return (
    <>
      <KanbanBoard
        columns={COLUMNS}
        items={sortByDue(tasks)}
        getId={(t) => t.id}
        getStatus={(t) => t.status}
        onMove={(t, s) => actions.changeStatus(t, s)}
        onAdd={setCreatingIn}
        addLabel="Nova tarefa"
        renderCard={(t) => (
          <TaskCard
            task={t}
            onOpen={() => setEditing(t)}
            onToggle={() => actions.toggleDone(t)}
            onStatusChange={(s) => actions.changeStatus(t, s)}
            onDelete={() => actions.remove(t)}
          />
        )}
      />
      <TaskFormModal open={!!editing} task={editing} onClose={() => setEditing(null)} />
      <TaskFormModal open={!!creatingIn} defaults={{ ...defaults, status: creatingIn ?? undefined }} onClose={() => setCreatingIn(null)} />
    </>
  )
}
