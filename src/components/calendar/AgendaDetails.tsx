import { useState } from 'react'
import { ContentFormModal } from '@/components/contents/ContentFormModal'
import { EventFormModal } from '@/components/events/EventFormModal'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import type { AgendaItem } from '@/lib/selectors'
import { useData } from '@/store/useData'

/**
 * Abre os detalhes do item clicado usando os formulários existentes de cada entidade
 * (não há "segunda tarefa": o calendário edita a própria tarefa/evento/conteúdo).
 */
export function useAgendaDetails() {
  const [selected, setSelected] = useState<AgendaItem | null>(null)
  const { tasks, events, contents } = useData()
  // Busca a versão mais recente no estado (o item pode ter sido editado).
  const task = selected?.kind === 'task' ? tasks.find((t) => t.id === selected.id) : null
  const event = selected?.kind === 'event' ? events.find((e) => e.id === selected.id) : null
  const content = selected?.kind === 'content' ? contents.find((c) => c.id === selected.id) : null
  const close = () => setSelected(null)

  const modals = (
    <>
      <TaskFormModal open={!!task} task={task} onClose={close} />
      <EventFormModal open={!!event} event={event} onClose={close} />
      <ContentFormModal open={!!content} content={content} onClose={close} />
    </>
  )
  return { open: setSelected, modals }
}
