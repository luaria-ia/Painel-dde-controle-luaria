import { useConfirm } from '@/components/ui/confirmContext'
import { useToast } from '@/components/ui/toastContext'
import { TASK_STATUS } from '@/config/labels'
import { useData } from '@/store/useData'
import type { Task, TaskStatus } from '@/types'

/** Ações de tarefa reutilizadas em listas, Kanban e páginas de detalhe. */
export function useTaskActions() {
  const { setTaskStatus, deleteTask } = useData()
  const toast = useToast()
  const confirm = useConfirm()

  return {
    async changeStatus(task: Task, status: TaskStatus) {
      if (task.status === status) return
      const ok = await setTaskStatus(task.id, status)
      if (ok) toast.success(status === 'concluido' ? 'Tarefa concluída 🎉' : `Movida para "${TASK_STATUS[status].label}"`)
    },
    async toggleDone(task: Task) {
      const next: TaskStatus = task.status === 'concluido' ? 'a_fazer' : 'concluido'
      const ok = await setTaskStatus(task.id, next)
      if (ok) toast.success(next === 'concluido' ? 'Tarefa concluída 🎉' : 'Tarefa reaberta')
    },
    async remove(task: Task) {
      const yes = await confirm({ title: 'Excluir tarefa?', message: `"${task.title}" será excluída permanentemente.` })
      if (yes && (await deleteTask(task.id))) toast.success('Tarefa excluída')
    },
  }
}
