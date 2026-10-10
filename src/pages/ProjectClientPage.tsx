import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CalendarCheck, Columns3, Eye, LayoutList, Layers, Plus, UserX, CheckCircle2 } from 'lucide-react'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { ClientAvatar } from '@/components/clients/ClientList'
import { ContentKanban, ContentList } from '@/components/contents/ContentBoard'
import { ContentFormModal } from '@/components/contents/ContentFormModal'
import { FileFormModal } from '@/components/files/FileFormModal'
import { FileList } from '@/components/files/FileList'
import { PageHeader } from '@/components/layout/PageHeader'
import { DossierView } from '@/components/projects/areas/DossierView'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { TaskList } from '@/components/tasks/TaskList'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Segmented } from '@/components/ui/Segmented'
import { ContentMetricsPanel, Stat } from '@/components/workspace/ContentMetricsPanel'
import { CLIENT_STATUS, CONTENT_STATUS, CONTENT_STATUS_ORDER, PROJECT_STATUS } from '@/config/labels'
import { projectType } from '@/data/boards/projectTypes'
import { useAreaBoard } from '@/hooks/useAreaBoard'
import { contentStats } from '@/lib/contentStats'
import { formatDateShort } from '@/lib/format'
import { contentDate, sortByDue } from '@/lib/selectors'
import { useData } from '@/store/useData'
import type { Client, Project } from '@/types'
import type { ProjectAreaDef } from '@/types/boards'

const FIXED_TABS: Record<string, string> = { tarefas: 'Tarefas', arquivos: 'Arquivos', atividade: 'Atividade' }

/**
 * Espaço de UM cliente dentro de um projeto-operação (ex.: Social Media → Clientes → Luan Imóveis).
 * Tudo aqui é filtrado por project_id + client_id: o conteúdo de um cliente nunca aparece em outro.
 */
export function ProjectClientPage() {
  const { id = '', clientId = '' } = useParams()
  const { projectById, clientById } = useData()
  const project = projectById.get(id)
  const client = clientById.get(clientId)
  const workspace = project ? projectType(project.type).clientWorkspace : undefined

  if (!project || !client || !workspace) {
    return (
      <Card>
        <EmptyState
          icon={UserX}
          title="Cliente não encontrado neste projeto"
          action={
            <Link to={project ? `/projetos/${project.id}?aba=clientes` : '/projetos'} className="text-[13px] font-medium text-accent">
              Voltar
            </Link>
          }
        />
      </Card>
    )
  }
  return <Workspace key={`${project.id}-${client.id}`} project={project} client={client} />
}

function Workspace({ project, client }: { project: Project; client: Client }) {
  const { contents, tasks, files } = useData()
  const [params, setParams] = useSearchParams()
  const workspace = projectType(project.type).clientWorkspace!
  const [contentView, setContentView] = useState<'kanban' | 'lista'>('kanban')
  const [newContent, setNewContent] = useState(false)
  const [newTask, setNewTask] = useState(false)
  const [newFile, setNewFile] = useState(false)

  // Isolamento: somente o que pertence a ESTE projeto E a ESTE cliente.
  const scoped = <T extends { projectId: string | null; clientId: string | null }>(list: T[]) => list.filter((x) => x.projectId === project.id && x.clientId === client.id)
  const clientContents = scoped(contents)
  const clientTasks = sortByDue(scoped(tasks))
  const clientFiles = scoped(files)
  const pendingTasks = clientTasks.filter((t) => t.status !== 'concluido')
  const stats = contentStats(clientContents)

  const tabs = [
    { value: 'visao', label: 'Visão geral' },
    ...workspace.tabs.map((k) => {
      const area = workspace.areas.find((a) => a.key === k)
      if (area) return { value: k, label: `${area.icon} ${area.label}`, count: area.kind === 'contents' ? clientContents.length : undefined }
      return { value: k, label: FIXED_TABS[k] ?? k, count: k === 'tarefas' ? pendingTasks.length : k === 'arquivos' ? clientFiles.length : undefined }
    }),
  ]
  const tab = tabs.some((t) => t.value === params.get('aba')) ? params.get('aba')! : 'visao'
  const setTab = (t: string) => setParams(t === 'visao' ? {} : { aba: t }, { replace: true })
  const area = workspace.areas.find((a) => a.key === tab)
  const status = CLIENT_STATUS[client.status]

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: 'Projetos', to: '/projetos' },
          { label: project.name, to: `/projetos/${project.id}` },
          { label: 'Clientes', to: `/projetos/${project.id}?aba=clientes` },
          { label: client.name },
        ]}
        title={
          <span className="flex items-center gap-3">
            <ClientAvatar client={client} />
            {client.name}
          </span>
        }
        meta={
          <>
            <Badge>
              {projectType(project.type).icon} {project.name}
            </Badge>
            <Badge tone={status.tone}>{status.label}</Badge>
          </>
        }
        description={client.company || undefined}
        actions={
          <Link to={`/clientes/${client.id}`} className="text-[13px] font-medium text-accent hover:underline">
            Ficha completa do cliente →
          </Link>
        }
      />

      <Segmented className="mb-5" ariaLabel={`Seções de ${client.name}`} value={tab} onChange={setTab} options={tabs} />

      {tab === 'visao' && (
        <div className="flex flex-col gap-4">
          <section aria-label="Resumo do cliente" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Em produção" value={stats.production} icon={Layers} hint="roteiro e produção" />
            <Stat label="Aguardando aprovação" value={stats.approval} icon={Eye} />
            <Stat label="Agendados" value={stats.scheduled} icon={CalendarCheck} />
            <Stat label="Publicados no mês" value={stats.publishedMonth} icon={CheckCircle2} hint={`${stats.published} no total`} />
          </section>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Próximos prazos"
                description="Conteúdos dos próximos 14 dias"
                action={
                  <Button size="sm" variant="ghost" onClick={() => setTab('conteudo')}>
                    Ver conteúdo
                  </Button>
                }
              />
              {stats.upcoming.length === 0 ? (
                <p className="px-4 pb-5 text-[13px] text-subtle sm:px-5">Nada programado para os próximos dias.</p>
              ) : (
                <ul className="divide-y divide-line border-t border-line">
                  {stats.upcoming.slice(0, 8).map((c) => (
                    <li key={c.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px] sm:px-5">
                      <span className="tabular w-12 text-subtle">{formatDateShort(contentDate(c))}</span>
                      <span className="min-w-0 flex-1 truncate">{c.title}</span>
                      <Badge tone={CONTENT_STATUS[c.status].tone}>{CONTENT_STATUS[c.status].label}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card className="overflow-hidden">
              <CardHeader
                title={`Tarefas · ${pendingTasks.length} pendente${pendingTasks.length === 1 ? '' : 's'}`}
                action={
                  <Button size="sm" variant="ghost" icon={Plus} onClick={() => setNewTask(true)}>
                    Tarefa
                  </Button>
                }
              />
              <TaskList tasks={pendingTasks.slice(0, 6)} showProject={false} showClient={false} emptyTitle="Nenhuma tarefa pendente" />
            </Card>
          </div>
          <Card className="flex flex-wrap gap-x-8 gap-y-2 p-4 text-[13px] sm:p-5">
            <span>
              <span className="text-subtle">Projeto:</span> {project.name} · <Badge tone={PROJECT_STATUS[project.status].tone}>{PROJECT_STATUS[project.status].label}</Badge>
            </span>
            {client.whatsapp && (
              <span>
                <span className="text-subtle">WhatsApp:</span> {client.whatsapp}
              </span>
            )}
            {client.email && (
              <span>
                <span className="text-subtle">E-mail:</span> {client.email}
              </span>
            )}
          </Card>
        </div>
      )}

      {area && <AreaContent project={project} client={client} area={area} contents={clientContents} view={contentView} onView={setContentView} onNew={() => setNewContent(true)} />}

      {tab === 'tarefas' && (
        <Card className="overflow-hidden">
          <CardHeader
            title={`Tarefas de ${client.name}`}
            action={
              <Button size="sm" icon={Plus} onClick={() => setNewTask(true)}>
                Tarefa
              </Button>
            }
          />
          <TaskList
            tasks={clientTasks}
            showProject={false}
            showClient={false}
            emptyTitle="Nenhuma tarefa deste cliente"
            emptyAction={
              <Button size="sm" icon={Plus} onClick={() => setNewTask(true)}>
                Criar tarefa
              </Button>
            }
          />
        </Card>
      )}

      {tab === 'arquivos' && (
        <Card className="overflow-hidden">
          <CardHeader
            title={`Arquivos de ${client.name}`}
            action={
              <Button size="sm" icon={Plus} onClick={() => setNewFile(true)}>
                Arquivo
              </Button>
            }
          />
          <FileList files={clientFiles} showProject={false} />
        </Card>
      )}

      {tab === 'atividade' && (
        <Card className="overflow-hidden py-2">
          <ActivityFeed projectId={project.id} clientId={client.id} limit={60} />
        </Card>
      )}

      <ContentFormModal open={newContent} defaults={{ projectId: project.id, clientId: client.id }} onClose={() => setNewContent(false)} />
      <TaskFormModal open={newTask} defaults={{ projectId: project.id, clientId: client.id }} onClose={() => setNewTask(false)} />
      <FileFormModal open={newFile} defaults={{ projectId: project.id, clientId: client.id }} onClose={() => setNewFile(false)} />
    </div>
  )
}

function AreaContent({
  project,
  client,
  area,
  contents,
  view,
  onView,
  onNew,
}: {
  project: Project
  client: Client
  area: ProjectAreaDef
  contents: ReturnType<typeof useData>['contents']
  view: 'kanban' | 'lista'
  onView: (v: 'kanban' | 'lista') => void
  onNew: () => void
}) {
  if (area.kind === 'dossier') return <ClientDossier project={project} client={client} area={area} />
  if (area.kind === 'contents-metrics') return <ContentMetricsPanel contents={contents} />
  if (area.kind === 'contents')
    return (
      <>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {CONTENT_STATUS_ORDER.map((s) => (
              <Badge key={s} tone={CONTENT_STATUS[s].tone}>
                {CONTENT_STATUS[s].label}: {contents.filter((c) => c.status === s).length}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Segmented
              ariaLabel="Visualização"
              value={view}
              onChange={onView}
              options={[
                { value: 'kanban', label: 'Kanban', icon: Columns3 },
                { value: 'lista', label: 'Lista', icon: LayoutList },
              ]}
            />
            <Button size="sm" icon={Plus} onClick={onNew}>
              Conteúdo
            </Button>
          </div>
        </div>
        {/* Mesmo Kanban do módulo Conteúdo — só muda o contexto (projeto + cliente). */}
        {view === 'kanban' ? (
          <ContentKanban contents={contents} defaults={{ projectId: project.id, clientId: client.id }} />
        ) : (
          <Card className="overflow-hidden">
            <ContentList contents={contents} showProject={false} />
          </Card>
        )}
      </>
    )
  return null
}

function ClientDossier({ project, client, area }: { project: Project; client: Client; area: ProjectAreaDef }) {
  const { boardId, status } = useAreaBoard(project.id, area.board, client.id)
  if (status === 'loading') return <div className="h-80 animate-pulse rounded-xl bg-surface-2/60" aria-busy="true" />
  if (!boardId) return <Card className="p-5 text-[13px] text-muted">Não foi possível preparar a área {area.label}. Recarregue a página.</Card>
  return <DossierView key={boardId} boardId={boardId} description={area.description} />
}
