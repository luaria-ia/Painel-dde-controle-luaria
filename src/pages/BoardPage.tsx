import { useEffect, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { areaForBoard } from '@/data/boards/projectTypes'
import { boardRepository } from '@/repositories/boards'
import { useData } from '@/store/useData'

/**
 * Links antigos (/projetos/:id/quadros/:quadro) → a área do projeto que usa aquele quadro.
 * Não existe mais uma página “Quadros”: o workflow vive dentro das áreas do projeto.
 */
export function BoardPage() {
  const { id = '', boardId = '' } = useParams()
  const [params] = useSearchParams()
  const { projectById } = useData()
  const [target, setTarget] = useState<string | null>(null)
  const project = projectById.get(id)

  useEffect(() => {
    let alive = true
    boardRepository
      .get(boardId)
      .then((b) => {
        if (!alive) return
        const area = b && project && b.projectId === project.id ? areaForBoard(project.type, b.templateKey) : undefined
        const q = new URLSearchParams()
        if (area) q.set('aba', area.key)
        const card = params.get('cartao')
        if (area && card) q.set('cartao', card)
        setTarget(`/projetos/${id}${q.size ? `?${q}` : ''}`)
      })
      .catch(() => alive && setTarget(`/projetos/${id}`))
    return () => {
      alive = false
    }
  }, [boardId, id, params, project])

  return target ? <Navigate to={target} replace /> : <div className="h-40 animate-pulse rounded-xl bg-surface-2/60" aria-busy="true" />
}
