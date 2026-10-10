import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, CalendarDays, Clock, Columns3, FolderX, LayoutList, ListChecks, Pencil, Plus, Trash2, Users, Wallet } from 'lucide-react'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { AIGenerateCard } from '@/components/ai/AIGenerateCard'
import { AssistantPanel } from '@/components/ai/AssistantPanel'
import { BriefingToTasksModal } from '@/components/ai/BriefingToTasksModal'
import { InsightsCard } from '@/components/dashboard/SmartBlocks'
import { KnowledgeFormModal } from '@/components/knowledge/KnowledgeFormModal'
import { KnowledgeList } from '@/components/knowledge/KnowledgeList'
import { useAgendaDetails } from '@/components/calendar/AgendaDetails'
import { AgendaRow } from '@/components/calendar/AgendaItem'
import { ClientAvatar } from '@/components/clients/ClientList'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { ContentKanban, ContentList } from '@/components/contents/ContentBoard'
import { ContentFormModal } from '@/components/contents/ContentFormModal'
import { ContractList } from '@/components/contracts/ContractList'
import { ContractFormModal } from '@/components/contracts/ContractFormModal'
import { EventFormModal } from '@/components/events/EventFormModal'
import { FileFormModal } from '@/components/files/FileFormModal'
import { FileList } from '@/components/files/FileList'
import { FinancialCard } from '@/components/finance/FinancialCard'
import { TransactionFormModal } from '@/components/finance/TransactionFormModal'
import { TransactionList } from '@/components/finance/TransactionList'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { ProjectSettings } from '@/components/projects/ProjectSettings'
import { ProjectAreaView } from '@/components/projects/areas/ProjectAreaView'
import { OperationClients } from '@/components/workspace/OperationClients'
import { OperationOverview } from '@/components/workspace/OperationOverview'
import { projectType } from '@/data/boards/projectTypes'
import type { BuiltinProjectTab } from '@/types/boards'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { TaskKanban } from '@/components/tasks/TaskKanban'
import { TaskList } from '@/components/tasks/TaskList'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { useConfirm } from '@/components/ui/confirmContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Field'
import { Menu } from '@/components/ui/Menu'
import { Segmented } from '@/components/ui/Segmented'
import { useToast } from '@/components/ui/toastContext'
import { CLIENT_STATUS, CONTENT_STATUS, CONTENT_STATUS_ORDER, PROJECT_COLORS, PROJECT_STATUS } from '@/config/labels'
import { addDays, formatCurrency, formatDateTime, todayISO } from '@/lib/format'
import { buildAgenda, byProject, contractStatus, contractSummary, financeSummary, recentTransactions, sortByDue, taskCounts } from '@/lib/selectors'
import { cn, plural } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ProjectStatus, TransactionType } from '@/types'

/** Aba do projeto: 'visao', uma aba nativa (BuiltinProjectTab) ou uma área do tipo (ex.: 'crm', 'marketing', 'estrategia'). */
type Tab = string

export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const { projectById, clientById, tasks, clients, transactions, contents, contracts, files, events, knowledge, updateProject, deleteProject } = useData()
  const project = projectById.get(id)

  const [editing, setEditing] = useState(false)
  const [newTask, setNewTask] = useState(false)
  const [newClient, setNewClient] = useState(false)
  const [newTrx, setNewTrx] = useState<TransactionType | null>(null)
  const [newContent, setNewContent] = useState(false)
  const [newContract, setNewContract] = useState(false)
  const [newFile, setNewFile] = useState(false)
  const [newEvent, setNewEvent] = useState(false)
  const [newKnowledge, setNewKnowledge] = useState(false)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const [taskView, setTaskView] = useState<'lista' | 'kanban'>('lista')
  const [contentView, setContentView] = useState<'kanban' | 'lista'>('kanban')
  const details = useAgendaDetails()

  if (!project) {
    return (
      <Card>
        <EmptyState icon={FolderX} title="Projeto não encontrado" description="Ele pode ter sido excluído." action={<Button onClick={() => navigate('/projetos')}>Voltar para projetos</Button>} />
      </Card>
    )
  }

  const projectTasks = sortByDue(byProject(tasks, project.id))
  const projectTrx = byProject(transactions, project.id)
  const receitas = recentTransactions(projectTrx.filter((t) => t.type === 'receita'), Infinity)
  const despesas = recentTransactions(projectTrx.filter((t) => t.type === 'despesa'), Infinity)
  const projectClients = clients.filter((c) => c.projectIds.includes(project.id))
  const projectContents = byProject(contents, project.id)
  const projectContracts = byProject(contracts, project.id)
  const projectFiles = byProject(files, project.id)
  const projectEvents = byProject(events, project.id)
  const projectKnowledge = knowledge.filter((k) => k.projectId === project.id)
  const fin = financeSummary(projectTrx)
  const counts = taskCounts(projectTasks)
  const csum = contractSummary(projectContracts)
  const color = PROJECT_COLORS[project.color] ?? PROJECT_COLORS.slate
  const today = todayISO()
  const agenda = buildAgenda({ tasks: projectTasks, events: projectEvents, contents: projectContents }, today, addDays(today, 30)).filter((i) => !i.done)

  const typeDef = projectType(project.type)
  const client = project.clientId ? clientById.get(project.clientId) : undefined
  // Abas nativas do Business OS, filtradas e ordenadas pelo tipo do projeto (sem abas irrelevantes).
  const builtinTabs: Record<BuiltinProjectTab, { label: string; count?: number }> = {
    ia: { label: '🤖 IA' },
    tarefas: { label: 'Tarefas', count: counts.pendentes },
    conteudo: { label: 'Conteúdo', count: projectContents.length },
    clientes: { label: 'Clientes', count: projectClients.length },
    financeiro: { label: 'Financeiro' },
    contratos: { label: 'Contratos', count: projectContracts.length },
    arquivos: { label: 'Arquivos', count: projectFiles.length },
    conhecimento: { label: 'Conhecimento', count: projectKnowledge.length },
    agenda: { label: 'Agenda', count: agenda.length },
    atividade: { label: 'Atividade' },
    configuracoes: { label: 'Configurações' },
  }
  const areaKeys = new Set(typeDef.areas.map((a) => a.key))
  const tabs: Array<{ value: Tab; label: string; count?: number }> = [
    { value: 'visao', label: 'Visão geral' },
    // Áreas próprias do tipo (CRM, Marketing, Estratégia, Conteúdo…) logo depois da visão geral.
    ...typeDef.areas.map((a) => ({ value: a.key, label: `${a.icon} ${a.label}` })),
    ...(typeDef.tabs ?? (Object.keys(builtinTabs) as BuiltinProjectTab[])).filter((k) => !areaKeys.has(k)).map((k) => ({ value: k, ...builtinTabs[k] })),
  ]
  const defaultTab: Tab = 'visao'
  const tab = (tabs.some((t) => t.value === params.get('aba')) ? params.get('aba') : defaultTab) as Tab
  const activeArea = typeDef.areas.find((a) => a.key === tab)
  /** Aba nativa ativa (null quando a aba é uma área do tipo). */
  const builtin: Tab | null = activeArea ? null : tab
  const setTab = (t: Tab) => setParams(t === defaultTab ? {} : { aba: t }, { replace: true })

  const changeStatus = async (status: ProjectStatus) => {
    if (await updateProject(project.id, { status })) toast.success(`Projeto marcado como "${PROJECT_STATUS[status].label}"`)
  }

  const remove = async () => {
    const linked = projectTasks.length + projectTrx.length + projectContents.length + projectContracts.length + projectFiles.length + projectEvents.length
    const ok = await confirm({
      title: `Excluir "${project.name}"?`,
      message: (
        <>
          O projeto e os dados das áreas dele serão excluídos permanentemente.
          {linked > 0 && (
            <>
              {' '}
              {plural(projectTasks.length, 'tarefa', 'tarefas')}, {plural(projectTrx.length, 'lançamento', 'lançamentos')} e demais itens vinculados{' '}
              <strong className="text-fg">não serão apagados</strong> — ficarão sem projeto.
            </>
          )}
          <br />
          <span className="mt-2 block">Dica: para tirar da frente sem perder nada, use o status “Arquivado”.</span>
        </>
      ),
    })
    if (ok && (await deleteProject(project.id))) {
      toast.success('Projeto excluído')
      navigate('/projetos')
    }
  }

  const add = (label: string, onClick: () => void) => (
    <Button size="sm" variant="ghost" icon={Plus} onClick={onClick}>
      {label}
    </Button>
  )

  const financeCards = (
    <section aria-label="Resumo financeiro do projeto" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <FinancialCard label="Receita" cents={fin.receitaCents} icon={ArrowUpRight} tone="positive" hint="Recebido" />
      <FinancialCard label="Despesas" cents={fin.despesaCents} icon={ArrowDownRight} tone="negative" hint="Pago" />
      <FinancialCard label="Resultado" cents={fin.saldoCents} icon={Wallet} signed hint="Receita − despesas" />
      <FinancialCard label="A receber" cents={fin.aReceberCents} icon={Clock} tone="warning" hint={fin.aPagarCents ? `A pagar: ${formatCurrency(fin.aPagarCents)}` : 'Pendentes'} />
    </section>
  )

  return (
    <div>
      <PageHeader
        breadcrumb={client ? [{ label: 'Clientes', to: '/clientes' }, { label: client.name, to: `/clientes/${client.id}` }, { label: project.name }] : [{ label: 'Projetos', to: '/projetos' }, { label: project.name }]}
        title={
          <span className="flex items-center gap-3">
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-base font-semibold', color.soft)}>{project.name.charAt(0).toUpperCase()}</span>
            {project.name}
          </span>
        }
        meta={
          <>
            <Badge>
              {projectType(project.type).icon} {projectType(project.type).label}
            </Badge>
            {project.isDemo && <DemoBadge />}
          </>
        }
        actions={
          <>
            <Select
              compact
              aria-label="Status do projeto"
              value={project.status}
              options={Object.entries(PROJECT_STATUS).map(([value, s]) => ({ value, label: s.label }))}
              onChange={(e) => changeStatus(e.target.value as ProjectStatus)}
            />
            <Button size="sm" icon={Pencil} onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Menu items={[{ label: 'Excluir projeto', icon: Trash2, danger: true, onSelect: remove }]} />
          </>
        }
      />

      <Segmented className="mb-5" ariaLabel="Seções do projeto" value={tab} onChange={setTab} options={tabs} />

      {activeArea && <ProjectAreaView key={activeArea.key} project={project} area={activeArea} />}
      {builtin === 'atividade' && (
        <Card className="overflow-hidden py-2">
          <ActivityFeed projectId={project.id} limit={60} />
        </Card>
      )}
      {builtin === 'configuracoes' && <ProjectSettings project={project} onEdit={() => setEditing(true)} onDelete={remove} />}

      {/* ---------- Visão geral ---------- */}
      {builtin === 'visao' && typeDef.clientWorkspace && <OperationOverview project={project} clients={projectClients} />}
      {builtin === 'visao' && (
        <div className="flex flex-col gap-6">
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-subtle">Sobre</p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted">{project.description || 'Sem descrição.'}</p>
              </div>
              <dl className="grid shrink-0 grid-cols-3 gap-6 text-[13px] sm:text-right">
                <div>
                  <dt className="text-subtle">Status</dt>
                  <dd className="mt-1">
                    <Badge tone={PROJECT_STATUS[project.status].tone} dot>
                      {PROJECT_STATUS[project.status].label}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-subtle">Tarefas</dt>
                  <dd className="tabular mt-1 font-medium">
                    {counts.concluidas}/{counts.total}
                  </dd>
                </div>
                <div>
                  <dt className="text-subtle">Criado em</dt>
                  <dd className="mt-1 font-medium sm:whitespace-nowrap">{formatDateTime(project.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </Card>

          {financeCards}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="overflow-hidden lg:col-span-3">
              <CardHeader title="Próximos 30 dias" description="Prazos, eventos e publicações deste projeto" action={add('Evento', () => setNewEvent(true))} />
              {agenda.length ? (
                <div className="divide-y divide-line border-t border-line">
                  {agenda.slice(0, 6).map((i) => (
                    <AgendaRow key={`${i.kind}-${i.id}`} item={i} onClick={() => details.open(i)} />
                  ))}
                </div>
              ) : (
                <EmptyState compact icon={CalendarDays} title="Nada agendado" />
              )}
            </Card>
            <Card className="overflow-hidden lg:col-span-2">
              <CardHeader title="Resumo" />
              <ul className="divide-y divide-line border-t border-line text-[13.5px]">
                {[
                  { label: 'Tarefas pendentes', value: counts.pendentes, extra: counts.atrasadas ? `${counts.atrasadas} atrasada(s)` : null, tab: 'tarefas' as Tab },
                  { label: 'Conteúdos em aprovação', value: projectContents.filter((c) => c.status === 'aprovacao').length, tab: 'conteudo' as Tab },
                  { label: 'Conteúdos agendados', value: projectContents.filter((c) => c.status === 'agendado').length, tab: 'conteudo' as Tab },
                  { label: 'Clientes', value: projectClients.length, tab: 'clientes' as Tab },
                  { label: 'Contratos ativos', value: csum.ativos, extra: csum.mrrCents ? `${formatCurrency(csum.mrrCents)}/mês` : null, tab: 'contratos' as Tab },
                  { label: 'Arquivos', value: projectFiles.length, tab: 'arquivos' as Tab },
                ]
                  // Só atalhos para abas que existem neste tipo de projeto.
                  .filter((r) => tabs.some((t) => t.value === r.tab))
                  .map((r) => (
                  <li key={r.label}>
                    <button type="button" onClick={() => setTab(r.tab)} className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface-2/50 sm:px-5">
                      <span className="text-muted">{r.label}</span>
                      <span className="flex items-center gap-2">
                        {r.extra && <span className="text-[12px] text-subtle">{r.extra}</span>}
                        <span className="tabular font-semibold">{r.value}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <Card className="overflow-hidden">
            <CardHeader title="Atividade recente" description="Registrada automaticamente" />
            <div className="border-t border-line pb-3">
              <ActivityFeed projectId={project.id} limit={12} />
            </div>
          </Card>
        </div>
      )}

      {/* ---------- IA ---------- */}
      {builtin === 'ia' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <AIGenerateCard
              className="lg:col-span-3"
              title="Resumo com IA"
              description="Status, pendências, financeiro e próximos passos deste projeto"
              scope={{ type: 'project', id: project.id }}
              task="project_summary"
              prompt="Gere o resumo do projeto."
              buttonLabel="Resumir projeto"
            />
            <InsightsCard projectId={project.id} className="lg:col-span-2" />
          </div>
          <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-sm font-semibold">Transformar briefing em tarefas</p>
              <p className="text-[13px] text-muted">Cole um briefing; a IA sugere as tarefas e você aprova antes de criar.</p>
            </div>
            <Button icon={ListChecks} onClick={() => setBriefingOpen(true)}>
              Briefing → tarefas
            </Button>
          </Card>
          <AssistantPanel
            scope={{ type: 'project', id: project.id }}
            scopeLabel={project.name}
            suggestions={['Resuma o estado atual do projeto', 'Quais são minhas prioridades?', 'Existem tarefas atrasadas?', 'Analise o financeiro', 'Resuma os últimos conteúdos', 'O que eu deveria fazer hoje?']}
          />
          {projectKnowledge.length === 0 && (
            <p className="text-[12.5px] text-subtle">
              Dica: adicione informações na aba <button type="button" className="cursor-pointer font-medium text-accent hover:underline" onClick={() => setTab('conhecimento')}>Conhecimento</button> para respostas mais específicas sobre este projeto.
            </p>
          )}
        </div>
      )}

      {/* ---------- Conhecimento ---------- */}
      {builtin === 'conhecimento' && (
        <Card className="overflow-hidden">
          <CardHeader
            title="Conhecimento do projeto"
            description="Sobre a empresa, posicionamento, público, produtos, processos — usado como contexto pela IA"
            action={add('Conhecimento', () => setNewKnowledge(true))}
          />
          <div className="border-t border-line">
            <KnowledgeList items={projectKnowledge} showProject={false} emptyAction={<Button size="sm" icon={Plus} onClick={() => setNewKnowledge(true)}>Adicionar</Button>} />
          </div>
        </Card>
      )}

      {/* ---------- Tarefas ---------- */}
      {builtin === 'tarefas' && (
        <Card className="overflow-hidden">
          <CardHeader
            title={`Tarefas · ${counts.pendentes} pendente${counts.pendentes === 1 ? '' : 's'}`}
            action={
              <div className="flex items-center gap-2">
                <Segmented
                  ariaLabel="Visualização"
                  value={taskView}
                  onChange={setTaskView}
                  options={[
                    { value: 'lista', label: 'Lista', icon: LayoutList },
                    { value: 'kanban', label: 'Kanban', icon: Columns3 },
                  ]}
                />
                <Button size="sm" icon={Plus} onClick={() => setNewTask(true)}>
                  <span className="hidden sm:inline">Tarefa</span>
                </Button>
              </div>
            }
          />
          {taskView === 'lista' ? (
            <TaskList tasks={projectTasks} showProject={false} emptyTitle="Nenhuma tarefa neste projeto" emptyAction={<Button size="sm" icon={Plus} onClick={() => setNewTask(true)}>Criar tarefa</Button>} />
          ) : (
            <div className="px-4 pb-4 sm:px-5">
              <TaskKanban tasks={projectTasks} defaults={{ projectId: project.id }} />
            </div>
          )}
        </Card>
      )}

      {/* ---------- Conteúdo ---------- */}
      {builtin === 'conteudo' && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_STATUS_ORDER.map((s) => (
                <Badge key={s} tone={CONTENT_STATUS[s].tone}>
                  {CONTENT_STATUS[s].label}: {projectContents.filter((c) => c.status === s).length}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Segmented
                ariaLabel="Visualização"
                value={contentView}
                onChange={setContentView}
                options={[
                  { value: 'kanban', label: 'Kanban', icon: Columns3 },
                  { value: 'lista', label: 'Lista', icon: LayoutList },
                ]}
              />
              <Button size="sm" icon={Plus} onClick={() => setNewContent(true)}>
                Conteúdo
              </Button>
            </div>
          </div>
          {contentView === 'kanban' ? (
            <ContentKanban contents={projectContents} defaults={{ projectId: project.id }} />
          ) : (
            <Card className="overflow-hidden">
              <ContentList contents={projectContents} showProject={false} />
            </Card>
          )}
        </>
      )}

      {/* ---------- Clientes ---------- */}
      {builtin === 'clientes' && typeDef.clientWorkspace && <OperationClients project={project} clients={projectClients} />}
      {builtin === 'clientes' && !typeDef.clientWorkspace && (
        <Card className="overflow-hidden">
          <CardHeader title={`Clientes · ${projectClients.length}`} action={add('Novo', () => setNewClient(true))} />
          {projectClients.length === 0 ? (
            <EmptyState compact icon={Users} title="Nenhum cliente relacionado" description="Relacione clientes ao editar um cliente ou crie um novo aqui." />
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {projectClients.map((c) => (
                <li key={c.id}>
                  <Link to={`/clientes/${c.id}`} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2/50 sm:px-5">
                    <ClientAvatar client={c} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{c.name}</p>
                      <p className="truncate text-[12px] text-subtle">{c.company || c.email || '—'}</p>
                    </div>
                    <span className="hidden text-[12px] text-subtle sm:inline">
                      {byProject(contracts, project.id).filter((k) => k.clientId === c.id && contractStatus(k) === 'ativo').length} contrato(s) ativo(s)
                    </span>
                    <Badge tone={CLIENT_STATUS[c.status].tone}>{CLIENT_STATUS[c.status].label}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* ---------- Financeiro ---------- */}
      {builtin === 'financeiro' && (
        <div className="flex flex-col gap-6">
          {financeCards}
          <Card className="overflow-hidden">
            <CardHeader title="Receitas" action={add('Receita', () => setNewTrx('receita'))} />
            <TransactionList transactions={receitas} showProject={false} emptyTitle="Nenhuma receita neste projeto" />
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Despesas" action={add('Despesa', () => setNewTrx('despesa'))} />
            <TransactionList transactions={despesas} showProject={false} showClient={false} emptyTitle="Nenhuma despesa neste projeto" />
          </Card>
        </div>
      )}

      {/* ---------- Contratos ---------- */}
      {builtin === 'contratos' && (
        <Card className="overflow-hidden">
          <CardHeader
            title="Contratos"
            description={csum.mrrCents ? `Recorrente: ${formatCurrency(csum.mrrCents)}/mês` : undefined}
            action={add('Contrato', () => setNewContract(true))}
          />
          <ContractList contracts={projectContracts} />
        </Card>
      )}

      {/* ---------- Arquivos ---------- */}
      {builtin === 'arquivos' && (
        <Card className="overflow-hidden">
          <CardHeader title="Arquivos" action={add('Arquivo', () => setNewFile(true))} />
          <FileList files={projectFiles} showProject={false} />
        </Card>
      )}

      {/* ---------- Agenda ---------- */}
      {builtin === 'agenda' && (
        <Card className="overflow-hidden">
          <CardHeader
            title="Agenda — próximos 30 dias"
            action={
              <div className="flex gap-1">
                <Link to="/calendario" className="inline-flex h-8 items-center px-2 text-[13px] font-medium text-muted hover:text-fg">
                  Calendário
                </Link>
                {add('Evento', () => setNewEvent(true))}
              </div>
            }
          />
          {agenda.length ? (
            <div className="divide-y divide-line border-t border-line">
              {agenda.map((i) => (
                <AgendaRow key={`${i.kind}-${i.id}`} item={i} onClick={() => details.open(i)} />
              ))}
            </div>
          ) : (
            <EmptyState compact icon={CalendarDays} title="Nada agendado nos próximos 30 dias" />
          )}
        </Card>
      )}

      {details.modals}
      <ProjectFormModal open={editing} project={project} onClose={() => setEditing(false)} />
      <TaskFormModal open={newTask} defaults={{ projectId: project.id }} onClose={() => setNewTask(false)} />
      <ClientFormModal open={newClient} defaultProjectId={project.id} onClose={() => setNewClient(false)} />
      <TransactionFormModal open={!!newTrx} type={newTrx ?? 'receita'} defaults={{ projectId: project.id }} onClose={() => setNewTrx(null)} />
      <ContentFormModal open={newContent} defaults={{ projectId: project.id }} onClose={() => setNewContent(false)} />
      <ContractFormModal open={newContract} defaults={{ projectId: project.id }} onClose={() => setNewContract(false)} />
      <FileFormModal open={newFile} defaults={{ projectId: project.id }} onClose={() => setNewFile(false)} />
      <EventFormModal open={newEvent} defaults={{ projectId: project.id }} onClose={() => setNewEvent(false)} />
      <KnowledgeFormModal open={newKnowledge} defaults={{ projectId: project.id }} onClose={() => setNewKnowledge(false)} />
      <BriefingToTasksModal open={briefingOpen} projectId={project.id} onClose={() => setBriefingOpen(false)} />
    </div>
  )
}
