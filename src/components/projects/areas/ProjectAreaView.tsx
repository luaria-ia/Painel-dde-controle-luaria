import { BoardWorkspace } from '@/components/boards/BoardWorkspace'
import { Card } from '@/components/ui/Card'
import { projectType } from '@/data/boards/projectTypes'
import { useAreaBoard } from '@/hooks/useAreaBoard'
import type { Project } from '@/types'
import type { ProjectAreaDef } from '@/types/boards'
import { ContentMetrics } from './ContentMetrics'
import { DossierView } from './DossierView'

/** Renderiza uma área do projeto conforme o tipo dela: Kanban, dossiê ou painel. */
export function ProjectAreaView({ project, area }: { project: Project; area: ProjectAreaDef }) {
  // Métricas leem o quadro da área de origem.
  const boardKey = area.kind === 'metrics' ? projectType(project.type).areas.find((a) => a.key === area.source)?.board : area.board
  const { boardId, status } = useAreaBoard(project.id, boardKey)

  if (status === 'loading') return <div className="h-80 animate-pulse rounded-xl bg-surface-2/60" aria-busy="true" aria-label={`Carregando ${area.label}`} />
  if (!boardId) return <Card className="p-5 text-[13px] text-muted">Não foi possível preparar a área {area.label}. Recarregue a página.</Card>

  if (area.kind === 'dossier') return <DossierView key={boardId} boardId={boardId} description={area.description} />
  if (area.kind === 'metrics') return <ContentMetrics key={boardId} boardId={boardId} />
  return (
    <div>
      {area.description && <p className="mb-3 text-[13px] text-muted">{area.description}</p>}
      <BoardWorkspace key={boardId} project={project} boardId={boardId} />
    </div>
  )
}
