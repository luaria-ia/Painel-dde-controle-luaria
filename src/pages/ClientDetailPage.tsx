import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock, FileSignature, Mail, MessageCircle, Pencil, Phone, Plus, Building2, Trash2, UserPlus, UserX, Receipt } from 'lucide-react'
import { ClientAvatar } from '@/components/clients/ClientList'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { ClientProjects } from '@/components/clients/ClientProjects'
import { ClientCommercialHistory } from '@/components/clients/ClientCommercialHistory'
import { AIGenerateCard } from '@/components/ai/AIGenerateCard'
import { AssistantPanel } from '@/components/ai/AssistantPanel'
import { useAgendaDetails } from '@/components/calendar/AgendaDetails'
import { AgendaRow } from '@/components/calendar/AgendaItem'
import { ContentList } from '@/components/contents/ContentBoard'
import { ContractList } from '@/components/contracts/ContractList'
import { ContractFormModal } from '@/components/contracts/ContractFormModal'
import { EventFormModal } from '@/components/events/EventFormModal'
import { FinancialCard } from '@/components/finance/FinancialCard'
import { TransactionFormModal } from '@/components/finance/TransactionFormModal'
import { TransactionList } from '@/components/finance/TransactionList'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import { TaskList } from '@/components/tasks/TaskList'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { useConfirm } from '@/components/ui/confirmContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { Menu } from '@/components/ui/Menu'
import { useToast } from '@/components/ui/toastContext'
import { CLIENT_STATUS } from '@/config/labels'
import { addDays, formatCurrency, formatDateTime, formatDate, todayISO } from '@/lib/format'
import { buildAgenda, byClient, contractSummary, financeSummary, recentTransactions, sortByDue } from '@/lib/selectors'
import { useData } from '@/store/useData'
import type { LucideIcon } from 'lucide-react'

interface HistoryEvent {
  date: string
  icon: LucideIcon
  text: string
  tone?: string
}

export function ClientDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const { clientById, tasks, transactions, contracts, events, contents, deleteClient } = useData()
  const client = clientById.get(id)

  const [editing, setEditing] = useState(false)
  const [newTask, setNewTask] = useState(false)
  const [newIncome, setNewIncome] = useState(false)
  const [newContract, setNewContract] = useState(false)
  const [newEvent, setNewEvent] = useState(false)
  const details = useAgendaDetails()

  if (!client) {
    return (
      <Card>
        <EmptyState icon={UserX} title="Cliente não encontrado" description="Ele pode ter sido excluído." action={<Button onClick={() => navigate('/clientes')}>Voltar para clientes</Button>} />
      </Card>
    )
  }

  const clientTasks = sortByDue(byClient(tasks, client.id))
  const receitas = recentTransactions(byClient(transactions, client.id).filter((t) => t.type === 'receita'), Infinity)
  const fin = financeSummary(receitas)
  const defaultProject = client.projectIds[0]
  const clientContracts = byClient(contracts, client.id)
  const clientContents = byClient(contents, client.id)
  const csum = contractSummary(clientContracts)
  const agenda = buildAgenda(
    { tasks: clientTasks, events: byClient(events, client.id), contents: clientContents },
    todayISO(),
    addDays(todayISO(), 60),
  ).filter((i) => !i.done)

  // Histórico básico: eventos derivados dos dados existentes, do mais recente ao mais antigo.
  const history: HistoryEvent[] = [
    { date: client.createdAt, icon: UserPlus, text: 'Cliente cadastrado' },
    ...clientTasks.map((t) => ({ date: t.createdAt, icon: Plus, text: `Tarefa criada: ${t.title}` })),
    ...clientTasks.filter((t) => t.completedAt).map((t) => ({ date: t.completedAt!, icon: CheckCircle2, text: `Tarefa concluída: ${t.title}`, tone: 'text-emerald-500' })),
    ...clientContracts.map((k) => ({ date: `${k.startDate}T12:00:00`, icon: FileSignature, text: `Contrato: ${k.title}`, tone: 'text-sky-500' })),
    ...receitas.map((t) => ({
      date: `${t.date}T12:00:00`,
      icon: t.status === 'recebido' ? ArrowUpRight : Clock,
      text: `${t.status === 'recebido' ? 'Recebido' : t.status === 'atrasado' ? 'Atrasado' : 'A receber'}: ${t.description} · ${formatCurrency(t.amountCents)}`,
      tone: t.status === 'recebido' ? 'text-emerald-500' : t.status === 'atrasado' ? 'text-rose-500' : 'text-amber-500',
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)

  const remove = async () => {
    const ok = await confirm({
      title: `Excluir "${client.name}"?`,
      message: 'O cliente será excluído permanentemente. Tarefas e receitas vinculadas serão mantidas, apenas sem cliente.',
    })
    if (ok && (await deleteClient(client.id))) {
      toast.success('Cliente excluído')
      navigate('/clientes')
    }
  }

  const contact: Array<{ icon: LucideIcon; label: string; value: string; href?: string }> = [
    { icon: Building2, label: 'Empresa', value: client.company },
    { icon: Mail, label: 'E-mail', value: client.email, href: client.email ? `mailto:${client.email}` : undefined },
    { icon: Phone, label: 'Telefone', value: client.phone, href: client.phone ? `tel:${client.phone.replace(/\D/g, '')}` : undefined },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: client.whatsapp,
      href: client.whatsapp ? `https://wa.me/55${client.whatsapp.replace(/\D/g, '')}` : undefined,
    },
  ]

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Clientes', to: '/clientes' }, { label: client.name }]}
        title={
          <span className="flex items-center gap-3">
            <ClientAvatar client={client} />
            {client.name}
          </span>
        }
        meta={
          <>
            <Badge tone={CLIENT_STATUS[client.status].tone} dot>
              {CLIENT_STATUS[client.status].label}
            </Badge>
            {client.isDemo && <DemoBadge />}
          </>
        }
        actions={
          <>
            <Button size="sm" icon={Pencil} onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Menu items={[{ label: 'Excluir cliente', icon: Trash2, danger: true, onSelect: remove }]} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Informações */}
          <Card className="p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold">Informações</h2>
            <dl className="flex flex-col gap-3">
              {contact.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3 text-[13px]">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                  <div className="min-w-0">
                    <dt className="text-subtle">{label}</dt>
                    <dd className="truncate font-medium">
                      {value ? (
                        href ? (
                          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="hover:text-accent hover:underline">
                            {value}
                          </a>
                        ) : (
                          value
                        )
                      ) : (
                        <span className="font-normal text-subtle">—</span>
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
            {client.notes && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-[13px] text-subtle">Observações</p>
                <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-line text-muted">{client.notes}</p>
              </div>
            )}
            <p className="mt-4 border-t border-line pt-3 text-[12px] text-subtle">Cliente desde {formatDateTime(client.createdAt)}</p>
          </Card>

          {/* Projetos */}
          <ClientProjects client={client} />
          <ClientCommercialHistory clientId={client.id} />

          {/* Histórico */}
          <Card className="p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold">Histórico</h2>
            <ol className="relative flex flex-col gap-3 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-line">
              {history.map((e, i) => (
                <li key={i} className="relative flex gap-3 text-[13px]">
                  <span className="relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface">
                    <e.icon className={`h-3.5 w-3.5 ${e.tone ?? 'text-subtle'}`} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-muted">{e.text}</p>
                    <p className="text-[11.5px] text-subtle">{formatDate(e.date.slice(0, 10))}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <AIGenerateCard
            title="Assistente do cliente"
            description="Resumo do relacionamento, pronto para a próxima reunião"
            scope={{ type: 'client', id: client.id }}
            task="client_brief"
            prompt="Prepare um resumo deste cliente para a próxima reunião."
            buttonLabel="Preparar resumo"
          />

          <section aria-label="Resumo financeiro do cliente" className="grid grid-cols-2 gap-3">
            <FinancialCard label="Total recebido" cents={fin.receitaCents} icon={ArrowUpRight} tone="positive" />
            <FinancialCard label="A receber" cents={fin.aReceberCents} icon={Clock} tone="warning" hint={fin.atrasadoCents ? `Atrasado: ${formatCurrency(fin.atrasadoCents)}` : undefined} />
          </section>

          <Card className="overflow-hidden">
            <CardHeader
              title="Tarefas"
              action={
                <Button size="sm" variant="ghost" icon={Plus} onClick={() => setNewTask(true)}>
                  Tarefa
                </Button>
              }
            />
            <div>
              <TaskList tasks={clientTasks} showClient={false} emptyTitle="Nenhuma tarefa para este cliente" />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Receitas"
              action={
                <Button size="sm" variant="ghost" icon={Plus} onClick={() => setNewIncome(true)}>
                  Receita
                </Button>
              }
            />
            <div>
              {receitas.length === 0 ? (
                <EmptyState compact icon={Receipt} title="Nenhuma receita deste cliente" />
              ) : (
                <TransactionList transactions={receitas} showClient={false} />
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Contratos"
              description={csum.mrrCents ? `Recorrente: ${formatCurrency(csum.mrrCents)}/mês` : undefined}
              action={
                <Button size="sm" variant="ghost" icon={Plus} onClick={() => setNewContract(true)}>
                  Contrato
                </Button>
              }
            />
            <ContractList contracts={clientContracts} showClient={false} />
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Agenda"
              description="Próximos 60 dias: reuniões, prazos e publicações"
              action={
                <Button size="sm" variant="ghost" icon={Plus} onClick={() => setNewEvent(true)}>
                  Evento
                </Button>
              }
            />
            {agenda.length ? (
              <div className="divide-y divide-line border-t border-line">
                {agenda.map((i) => (
                  <AgendaRow key={`${i.kind}-${i.id}`} item={i} onClick={() => details.open(i)} />
                ))}
              </div>
            ) : (
              <EmptyState compact icon={CalendarDays} title="Nada agendado" />
            )}
          </Card>

          <AssistantPanel
            scope={{ type: 'client', id: client.id }}
            scopeLabel={client.name}
            suggestions={['Resuma o relacionamento', 'Resuma os projetos e contratos', 'O que está pendente com este cliente?', 'Prepare uma pauta de reunião']}
          />

          {clientContents.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader title={`Conteúdos · ${clientContents.length}`} />
              <ContentList contents={clientContents} />
            </Card>
          )}
        </div>
      </div>

      <ClientFormModal open={editing} client={client} onClose={() => setEditing(false)} />
      <TaskFormModal open={newTask} defaults={{ clientId: client.id, projectId: defaultProject ?? null }} onClose={() => setNewTask(false)} />
      <TransactionFormModal open={newIncome} type="receita" defaults={{ clientId: client.id, projectId: defaultProject }} onClose={() => setNewIncome(false)} />
      <ContractFormModal open={newContract} defaults={{ clientId: client.id, projectId: defaultProject }} onClose={() => setNewContract(false)} />
      <EventFormModal open={newEvent} defaults={{ clientId: client.id, projectId: defaultProject ?? null }} onClose={() => setNewEvent(false)} />
      {details.modals}
    </div>
  )
}
