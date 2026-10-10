import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/toastContext'
import { findBoardTemplate } from '@/data/boards/projectTypes'
import { boardRepository } from '@/repositories/boards'
import type { ID } from '@/types'

const message = (err: unknown) => (err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')

/**
 * Quadro que armazena uma área do projeto (pela chave do template).
 * Se ainda não existir (projeto antigo, tipo trocado), é criado na hora pelo banco — a área nunca abre vazia.
 */
export function useAreaBoard(projectId: ID, templateKey: string | undefined, clientId?: ID) {
  const toast = useToast()
  const [state, setState] = useState<{ boardId: ID | null; status: 'loading' | 'ready' | 'error' }>({ boardId: null, status: 'loading' })

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const template = findBoardTemplate(templateKey)
        if (!template) throw new Error('Área sem modelo configurado.')
        // Área do projeto (sem cliente) ou área de UM cliente dentro do projeto — nunca mistura.
        const find = async () => (await boardRepository.listBy([projectId])).find((b) => b.templateKey === template.key && (clientId ? b.clientId === clientId : !b.clientId))
        let board = await find()
        if (!board) {
          if (clientId) await boardRepository.provisionForClient(projectId, clientId, template)
          else await boardRepository.provision(projectId, [template])
          board = await find()
        }
        if (alive) setState({ boardId: board?.id ?? null, status: board ? 'ready' : 'error' })
      } catch (err) {
        if (!alive) return
        toast.error(message(err))
        setState({ boardId: null, status: 'error' })
      }
    })()
    return () => {
      alive = false
    }
  }, [projectId, templateKey, clientId, toast])

  return state
}
