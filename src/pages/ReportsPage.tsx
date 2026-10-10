import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, Hourglass, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { ProjectLink } from '@/components/common/EntityLinks'
import { FinancialCard } from '@/components/finance/FinancialCard'
import { MonthlyChart } from '@/components/finance/MonthlyChart'
import { ComparisonReport } from '@/components/reports/ComparisonReport'
import { WeeklyDoneChart } from '@/components/reports/WeeklyDoneChart'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table'
import { CLIENT_STATUS, PROJECT_STATUS, TASK_PRIORITY } from '@/config/labels'
import { addDays, formatCurrency, monthKey, todayISO, toISODate } from '@/lib/format'
import {
  byClient,
  byProject,
  contractMonthlyCents,
  contractStatus,
  financeSummary,
  monthlySeriesBetween,
  taskCounts,
} from '@/lib/selectors'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ClientStatus, ISODate, ProjectStatus, TaskPriority, Transaction } from '@/types'

type Tab = 'financeiro' | 'comparativo' | 'projetos' | 'tarefas' | 'clientes'
type Period = 'mes' | '3m' | '6m' | 'ano' | 'tudo' | 'custom'

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'projetos', label: 'Projetos' },
  { value: 'tarefas', label: 'Tarefas' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'comparativo', label: 'Comparativo' },
]

const PERIODS: Array<{ value: Period; label: string }> = [
  { value: 'mes', label: 'Este mês' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: 'ano', label: 'Este ano' },
  { value: 'tudo', label: 'Todo o período' },
  { value: 'custom', label: 'Personalizado' },
]

function periodRange(period: Period, custom: { from: string; to: string }, transactions: Transaction[]): { from: ISODate; to: ISODate } {
  const now = new Date()
  const today = todayISO()
  const monthStart = (back: number) => toISODate(new Date(now.getFullYear(), now.getMonth() - back, 1))
  const monthEnd = toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  switch (period) {
    case 'mes':
      return { from: monthStart(0), to: monthEnd }
    case '3m':
      return { from: monthStart(2), to: monthEnd }
    case '6m':
      return { from: monthStart(5), to: monthEnd }
    case 'ano':
      return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` }
    case 'custom':
      return { from: custom.from || addDays(today, -365), to: custom.to || today }
    default: {
      const dates = transactions.map((t) => t.date).sort()
      return { from: dates[0] ?? monthStart(0), to: dates[dates.length - 1] && dates[dates.length - 1] > today ? dates[dates.length - 1] : today }
    }
  }
}

function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card">
      <span className="text-[13px] font-medium text-muted">{label}</span>
      <span className={cn('tabular mt-2 text-2xl font-semibold tracking-tight', tone)}>{value}</span>
    </div>
  )
}

const money = (c: number) => <span className={cn('tabular', c < 0 && 'text-rose-600 dark:text-rose-400')}>{formatCurrency(c)}</span>

export function ReportsPage() {
  const data = useData()
  const { projects, tasks, clients, transactions, contracts, contents } = data
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some((t) => t.value === params.get('aba')) ? params.get('aba') : 'financeiro') as Tab
  const [period, setPeriod] = useState<Period>('6m')
  const [custom, setCustom] = useState({ from: '', to: '' })
  const [projectId, setProjectId] = useState('')

  const range = periodRange(period, custom, transactions)
  const inPeriod = transactions.filter((t) => t.date >= range.from && t.date <= range.to)
  const scoped = projectId ? byProject(inPeriod, projectId) : inPeriod
  const showPeriod = tab === 'financeiro' || tab === 'projetos' || tab === 'clientes'

  return (
    <div>
      <PageHeader title="Relatórios" description="Números calculados a partir dos dados reais do sistema." />

      <Segmented className="mb-4" ariaLabel="Relatório" value={tab} onChange={(t) => setParams(t === 'financeiro' ? {} : { aba: t }, { replace: true })} options={TABS} />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {showPeriod && (
          <Select compact aria-label="Período" value={period} options={PERIODS} onChange={(e) => setPeriod(e.target.value as Period)} />
        )}
        {showPeriod && period === 'custom' && (
          <>
            <Input aria-label="De" type="date" className="h-8 text-[13px]" value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} />
            <Input aria-label="Até" type="date" className="h-8 text-[13px]" value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} />
          </>
        )}
        {(tab === 'financeiro' || tab === 'tarefas') && (
          <Select compact aria-label="Projeto" value={projectId} placeholder="Todos os projetos" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />
        )}
      </div>

      {tab === 'financeiro' && <FinanceReport transactions={scoped} range={range} groupByProject={!projectId} />}

      {tab === 'projetos' && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => (
              <Stat key={s} label={`Projetos ${PROJECT_STATUS[s].label.toLowerCase()}s`} value={projects.filter((p) => p.status === s).length} />
            ))}
          </div>
          <Card className="overflow-hidden">
            <CardHeader title="Por projeto" description="Tarefas (total) e financeiro do período selecionado" />
            <Table className="min-w-[820px]">
              <THead>
                <tr>
                  <Th>Projeto</Th>
                  <Th className="w-28">Status</Th>
                  <Th className="w-20 text-right">Tarefas</Th>
                  <Th className="w-24 text-right">Concluídas</Th>
                  <Th className="w-24 text-right">Conteúdos</Th>
                  <Th className="w-28 text-right">Receita</Th>
                  <Th className="w-28 text-right">Despesas</Th>
                  <Th className="w-28 text-right">Resultado</Th>
                </tr>
              </THead>
              <TBody>
                {projects.map((p) => {
                  const tc = taskCounts(byProject(tasks, p.id))
                  const fin = financeSummary(byProject(inPeriod, p.id))
                  return (
                    <Tr key={p.id}>
                      <Td>
                        <ProjectLink id={p.id} className="text-sm font-medium text-fg" />
                      </Td>
                      <Td>
                        <Badge tone={PROJECT_STATUS[p.status].tone}>{PROJECT_STATUS[p.status].label}</Badge>
                      </Td>
                      <Td className="tabular text-right">{tc.total}</Td>
                      <Td className="tabular text-right text-muted">{tc.concluidas}</Td>
                      <Td className="tabular text-right text-muted">{byProject(contents, p.id).length}</Td>
                      <Td className="text-right">{money(fin.receitaCents)}</Td>
                      <Td className="text-right">{money(fin.despesaCents)}</Td>
                      <Td className="text-right font-medium">{money(fin.saldoCents)}</Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
          </Card>
        </>
      )}

      {tab === 'tarefas' && <TasksReport projectId={projectId} />}

      {tab === 'comparativo' && <ComparisonReport />}

      {tab === 'clientes' && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(Object.keys(CLIENT_STATUS) as ClientStatus[]).map((s) => (
              <Stat key={s} label={`Clientes: ${CLIENT_STATUS[s].label.toLowerCase()}`} value={clients.filter((c) => c.status === s).length} />
            ))}
            <Stat
              label="Recorrente mensal"
              value={formatCurrency(contracts.filter((c) => contractStatus(c) === 'ativo').reduce((a, c) => a + contractMonthlyCents(c), 0))}
            />
          </div>
          <Card className="overflow-hidden">
            <CardHeader title="Por cliente" description="Receita recebida no período e contratos ativos" />
            <Table className="min-w-[760px]">
              <THead>
                <tr>
                  <Th>Cliente</Th>
                  <Th className="w-32">Status</Th>
                  <Th>Projetos</Th>
                  <Th className="w-24 text-right">Contratos</Th>
                  <Th className="w-32 text-right">Receita</Th>
                  <Th className="w-28 text-right">A receber</Th>
                </tr>
              </THead>
              <TBody>
                {[...clients]
                  .map((c) => ({ c, fin: financeSummary(byClient(inPeriod, c.id)) }))
                  .sort((a, b) => b.fin.receitaCents - a.fin.receitaCents)
                  .map(({ c, fin }) => (
                    <Tr key={c.id}>
                      <Td className="font-medium">{c.name}</Td>
                      <Td>
                        <Badge tone={CLIENT_STATUS[c.status].tone}>{CLIENT_STATUS[c.status].label}</Badge>
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {c.projectIds.length ? c.projectIds.map((id) => <ProjectLink key={id} id={id} />) : <span className="text-subtle">—</span>}
                        </div>
                      </Td>
                      <Td className="tabular text-right text-muted">{byClient(contracts, c.id).filter((k) => contractStatus(k) === 'ativo').length}</Td>
                      <Td className="text-right font-medium">{money(fin.receitaCents)}</Td>
                      <Td className="text-right text-muted">{money(fin.aReceberCents)}</Td>
                    </Tr>
                  ))}
              </TBody>
            </Table>
            {clients.length === 0 && <p className="px-5 py-6 text-center text-[13px] text-subtle">Nenhum cliente cadastrado.</p>}
          </Card>
        </>
      )}
    </div>
  )
}

function TasksReport({ projectId }: { projectId: string }) {
  const { tasks, projects } = useData()
  const list = projectId ? byProject(tasks, projectId) : tasks
  const c = taskCounts(list)
  const pct = c.total ? Math.round((c.concluidas / c.total) * 100) : 0
  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total" value={c.total} />
        <Stat label="Concluídas" value={c.concluidas} tone="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Em andamento" value={c.emAndamento} tone="text-sky-600 dark:text-sky-400" />
        <Stat label="A fazer" value={c.aFazer} />
        <Stat label="Atrasadas" value={c.atrasadas} tone={c.atrasadas ? 'text-rose-600 dark:text-rose-400' : undefined} />
        <Stat label="Taxa de conclusão" value={`${pct}%`} />
      </div>
      <Card className="mb-4">
        <CardHeader title="Produtividade" description="Tarefas concluídas por semana (últimas 8 semanas)" />
        <div className="px-3 pb-4 sm:px-4">
          <WeeklyDoneChart tasks={list} />
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader title="Por projeto" />
          <Table className="min-w-[560px]">
            <THead>
              <tr>
                <Th>Projeto</Th>
                <Th className="w-20 text-right">Total</Th>
                <Th className="w-24 text-right">Concluídas</Th>
                <Th className="w-28 text-right">Andamento</Th>
                <Th className="w-24 text-right">Atrasadas</Th>
              </tr>
            </THead>
            <TBody>
              {[...projects.map((p) => ({ id: p.id, list: byProject(tasks, p.id) })), { id: null, list: tasks.filter((t) => !t.projectId) }]
                .filter((r) => r.list.length && (!projectId || r.id === projectId))
                .map((r) => {
                  const k = taskCounts(r.list)
                  return (
                    <Tr key={r.id ?? 'none'}>
                      <Td>{r.id ? <ProjectLink id={r.id} className="text-sm" /> : <span className="text-[13px] text-subtle">Sem projeto</span>}</Td>
                      <Td className="tabular text-right">{k.total}</Td>
                      <Td className="tabular text-right text-muted">{k.concluidas}</Td>
                      <Td className="tabular text-right text-muted">{k.emAndamento}</Td>
                      <Td className={cn('tabular text-right', k.atrasadas ? 'text-rose-600 dark:text-rose-400' : 'text-muted')}>{k.atrasadas}</Td>
                    </Tr>
                  )
                })}
            </TBody>
          </Table>
        </Card>
        <Card className="h-fit overflow-hidden">
          <CardHeader title="Pendentes por prioridade" />
          <ul className="divide-y divide-line border-t border-line">
            {(Object.keys(TASK_PRIORITY) as TaskPriority[]).reverse().map((p) => {
              const n = list.filter((t) => t.priority === p && t.status !== 'concluido').length
              return (
                <li key={p} className="flex items-center justify-between px-4 py-2.5 sm:px-5">
                  <Badge tone={TASK_PRIORITY[p].tone}>{TASK_PRIORITY[p].label}</Badge>
                  <span className="tabular text-sm font-medium">{n}</span>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </>
  )
}

function FinanceReport({ transactions, range, groupByProject }: { transactions: Transaction[]; range: { from: ISODate; to: ISODate }; groupByProject: boolean }) {
  const { projects } = useData()
  const s = financeSummary(transactions)
  const series = monthlySeriesBetween(transactions, monthKey(range.from), monthKey(range.to))

  const byCategory = (type: 'receita' | 'despesa') => {
    const map = new Map<string, number>()
    for (const t of transactions) {
      if (t.type !== type || (type === 'receita' ? t.status !== 'recebido' : t.status !== 'pago')) continue
      map.set(t.category, (map.get(t.category) ?? 0) + t.amountCents)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }

  return (
    <>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <FinancialCard label="Receita" cents={s.receitaCents} icon={TrendingUp} tone="positive" hint="Recebido no período" />
        <FinancialCard label="Despesas" cents={s.despesaCents} icon={TrendingDown} tone="negative" hint="Pago no período" />
        <FinancialCard label="Saldo" cents={s.saldoCents} icon={Wallet} signed />
        <FinancialCard label="A receber" cents={s.aReceberCents} icon={Clock} tone="warning" hint={s.atrasadoCents ? `Atrasado: ${formatCurrency(s.atrasadoCents)}` : undefined} />
        <FinancialCard label="A pagar" cents={s.aPagarCents} icon={Hourglass} tone="warning" />
      </section>

      <Card className="mt-4">
        <CardHeader title="Receitas x despesas" description="Por mês, no período selecionado" />
        <div className="px-3 pb-4 sm:px-4">
          <MonthlyChart series={series} />
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(['receita', 'despesa'] as const).map((type) => {
          const rows = byCategory(type)
          const total = rows.reduce((a, [, v]) => a + v, 0)
          return (
            <Card key={type} className="overflow-hidden">
              <CardHeader title={type === 'receita' ? 'Receitas por categoria' : 'Despesas por categoria'} />
              {rows.length === 0 ? (
                <p className="border-t border-line px-5 py-6 text-center text-[13px] text-subtle">Sem lançamentos no período.</p>
              ) : (
                <ul className="divide-y divide-line border-t border-line">
                  {rows.map(([cat, v]) => (
                    <li key={cat} className="px-4 py-2.5 sm:px-5">
                      <div className="flex items-center justify-between text-[13.5px]">
                        <span>{cat}</span>
                        <span className="tabular font-medium">{formatCurrency(v)}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div className={cn('h-full rounded-full', type === 'receita' ? 'bg-emerald-500/70' : 'bg-rose-500/60')} style={{ width: `${total ? (v / total) * 100 : 0}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )
        })}
      </div>

      {groupByProject && (
        <Card className="mt-4 overflow-hidden">
          <CardHeader title="Por projeto" />
          <Table className="min-w-[620px]">
            <THead>
              <tr>
                <Th>Projeto</Th>
                <Th className="w-32 text-right">Receita</Th>
                <Th className="w-32 text-right">Despesas</Th>
                <Th className="w-32 text-right">Resultado</Th>
                <Th className="w-32 text-right">A receber</Th>
              </tr>
            </THead>
            <TBody>
              {[...projects.map((p) => ({ id: p.id as string | null })), { id: null }].map(({ id }) => {
                const list = transactions.filter((t) => t.projectId === id)
                if (!list.length) return null
                const f = financeSummary(list)
                return (
                  <Tr key={id ?? 'none'}>
                    <Td>{id ? <ProjectLink id={id} className="text-sm" /> : <span className="text-[13px] text-subtle">Geral (sem projeto)</span>}</Td>
                    <Td className="text-right">{money(f.receitaCents)}</Td>
                    <Td className="text-right">{money(f.despesaCents)}</Td>
                    <Td className="text-right font-medium">{money(f.saldoCents)}</Td>
                    <Td className="text-right text-muted">{money(f.aReceberCents)}</Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        </Card>
      )}
    </>
  )
}
