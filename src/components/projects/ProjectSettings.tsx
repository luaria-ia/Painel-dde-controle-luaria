import { LayoutGrid, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { projectType } from '@/data/boards/projectTypes'
import { formatDate, formatDateTime } from '@/lib/format'
import { useData } from '@/store/useData'
import type { Project } from '@/types'

/** Aba “Configurações” do projeto: tipo e workflow, dados do projeto e zona de perigo. */
export function ProjectSettings({ project, onEdit, onDelete }: { project: Project; onEdit: () => void; onDelete: () => void }) {
  const { clientById } = useData()
  const t = projectType(project.type)
  const client = project.clientId ? clientById.get(project.clientId) : null
  const rows: Array<[string, string]> = [
    ['Cliente', client ? client.name : 'Projeto interno'],
    ['Responsáveis', project.owners.join(', ') || '—'],
    ['Início', formatDate(project.startDate)],
    ['Entrega', formatDate(project.dueDate)],
    ['Criado em', formatDateTime(project.createdAt)],
  ]
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader
          title="Tipo e workflow"
          description="O tipo do projeto define as áreas (abas) e workflows dele."
          action={
            <Button size="sm" icon={Pencil} onClick={onEdit}>
              Editar projeto
            </Button>
          }
        />
        <div className="flex flex-col gap-3 px-4 pb-5 sm:px-5">
          <p className="flex items-center gap-2 text-[14px] font-medium">
            <span aria-hidden="true">{t.icon}</span> {t.label}
            <Badge>{t.id}</Badge>
          </p>
          <p className="text-[13px] text-muted">{t.description}</p>
          {t.areas.map((a) => {
            const tpl = t.boards.find((b) => b.key === a.board)
            return (
              <div key={a.key} className="rounded-lg border border-line px-3 py-2.5 text-[13px]">
                <p className="flex items-center gap-1.5 font-medium">
                  <LayoutGrid className="h-3.5 w-3.5 text-accent" /> {a.icon} {a.label}
                  <span className="text-[11.5px] font-normal text-subtle">{a.kind === 'kanban' ? 'workflow' : a.kind === 'dossier' ? 'dossiê' : 'painel'}</span>
                </p>
                {tpl && a.kind === 'kanban' && <p className="mt-0.5 text-[12.5px] text-subtle">{tpl.lists.map((l) => `${l.icon} ${l.name}`).join(' → ')}</p>}
              </div>
            )
          })}
          <dl className="mt-1 grid grid-cols-1 gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-line py-1.5">
                <dt className="text-subtle">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>
      <Card className="border-rose-500/30">
        <CardHeader
          title="Zona de perigo"
          description="Excluir o projeto apaga também os dados das áreas (CRM, workflows, dossiês). Tarefas, lançamentos e arquivos ficam sem projeto."
        />
        <div className="px-4 pb-5 sm:px-5">
          <Button variant="danger" icon={Trash2} onClick={onDelete}>
            Excluir projeto
          </Button>
        </div>
      </Card>
    </div>
  )
}
