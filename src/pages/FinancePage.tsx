import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Clock, Hourglass, Plus, RefreshCw, Search, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { AssistantPanel } from '@/components/ai/AssistantPanel'
import { FinancialCard } from '@/components/finance/FinancialCard'
import { MonthlyChart } from '@/components/finance/MonthlyChart'
import { TransactionFormModal } from '@/components/finance/TransactionFormModal'
import { TransactionList } from '@/components/finance/TransactionList'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { EXPENSE_STATUS, INCOME_STATUS } from '@/config/labels'
import { formatCurrency, monthKey, monthLabel, todayISO } from '@/lib/format'
import { financeSummary, recentTransactions } from '@/lib/selectors'
import { normalize } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { TransactionType } from '@/types'

type Tab = 'visao-geral' | 'receitas' | 'despesas'

export function FinancePage() {
  const { transactions } = useData()
  const [params, setParams] = useSearchParams()
  const tab = (['receitas', 'despesas'].includes(params.get('tab') ?? '') ? params.get('tab') : 'visao-geral') as Tab
  const [creating, setCreating] = useState<TransactionType | null>(null)

  const setTab = (t: Tab) => setParams(t === 'visao-geral' ? {} : { tab: t }, { replace: true })
  const summary = financeSummary(transactions)

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Receitas, despesas e o saldo de todos os projetos."
        actions={
          <>
            <Button icon={Plus} onClick={() => setCreating('despesa')}>
              Despesa
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setCreating('receita')}>
              Receita
            </Button>
          </>
        }
      />

      <Segmented
        className="mb-5"
        ariaLabel="Seções do financeiro"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'visao-geral', label: 'Visão geral' },
          { value: 'receitas', label: 'Receitas', count: transactions.filter((t) => t.type === 'receita').length },
          { value: 'despesas', label: 'Despesas', count: transactions.filter((t) => t.type === 'despesa').length },
        ]}
      />

      {tab === 'visao-geral' && (
        <>
          <section aria-label="Totais" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <FinancialCard label="Receita total" cents={summary.receitaCents} icon={TrendingUp} tone="positive" hint="Recebido" />
            <FinancialCard label="Despesas totais" cents={summary.despesaCents} icon={TrendingDown} tone="negative" hint="Pago" />
            <FinancialCard label="Saldo" cents={summary.saldoCents} icon={Wallet} signed hint="Receita − despesas" />
            <FinancialCard
              label="A receber"
              cents={summary.aReceberCents}
              icon={Clock}
              tone="warning"
              hint={summary.atrasadoCents ? <span className="text-rose-600 dark:text-rose-400">Atrasado: {formatCurrency(summary.atrasadoCents)}</span> : 'Pendentes'}
            />
            <FinancialCard label="A pagar" cents={summary.aPagarCents} icon={Hourglass} tone="warning" hint="Despesas em aberto" />
          </section>

          {/* Previsibilidade & Recorrência Mensal */}
          <section aria-label="Recorrência e MRR" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3.5 rounded-xl border border-line bg-surface p-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-subtle uppercase tracking-wider">MRR · Mensalidades de Clientes</p>
                <p className="text-xl font-bold tabular tracking-tight text-fg">
                  {formatCurrency(summary.mrrCents)}
                  <span className="text-xs font-normal text-muted">/mês</span>
                </p>
                <p className="text-[12px] text-muted">Manutenção e suporte recorrente</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border border-line bg-surface p-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-subtle uppercase tracking-wider">Custos Fixos · Despesas Recorrentes</p>
                <p className="text-xl font-bold tabular tracking-tight text-fg">
                  {formatCurrency(summary.despesasRecorrentesCents)}
                  <span className="text-xs font-normal text-muted">/mês</span>
                </p>
                <p className="text-[12px] text-muted">Servidores, ferramentas e APIs de IA</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border border-line bg-surface p-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-subtle uppercase tracking-wider">Margem Recorrente Líquida</p>
                <p className="text-xl font-bold tabular tracking-tight text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary.margemRecorrenteCents)}
                  <span className="text-xs font-normal text-muted">/mês</span>
                </p>
                <p className="text-[12px] text-muted">Lucro mensal contratado</p>
              </div>
            </div>
          </section>

          <div className="mt-6">
            <AssistantPanel
              scope={{ type: 'finance' }}
              scopeLabel="Financeiro (todos os projetos)"
              task="finance_analysis"
              suggestions={['Resuma meu financeiro deste mês', 'Quais projetos tiveram maior receita?', 'Quais são minhas maiores despesas?', 'Quanto tenho a receber?', 'Compare este mês com o mês anterior']}
            />
          </div>
          <div className="mt-6 flex flex-col gap-6">
            <Card>
              <CardHeader title="Receitas x despesas" description="Últimos 6 meses (recebido e pago)" />
              <div className="px-3 pb-4 sm:px-4">
                <MonthlyChart transactions={transactions} />
              </div>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader
                title="Últimas movimentações"
                action={
                  <Link to="/financeiro?tab=receitas" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-fg">
                    Ver tudo <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
              <div>
                <TransactionList
                  transactions={recentTransactions(transactions.filter((t) => t.date <= todayISO()), 8)}
                  showClient={false}
                  emptyTitle="Nenhuma movimentação ainda"
                  emptyAction={
                    <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating('receita')}>
                      Registrar receita
                    </Button>
                  }
                />
              </div>
            </Card>
          </div>
        </>
      )}

      {tab !== 'visao-geral' && <TransactionsTab type={tab === 'receitas' ? 'receita' : 'despesa'} onCreate={() => setCreating(tab === 'receitas' ? 'receita' : 'despesa')} />}

      <TransactionFormModal open={!!creating} type={creating ?? 'receita'} onClose={() => setCreating(null)} />
    </div>
  )
}

function TransactionsTab({ type, onCreate }: { type: TransactionType; onCreate: () => void }) {
  const { transactions, projects } = useData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [projectId, setProjectId] = useState('')
  const [month, setMonth] = useState('')
  const [category, setCategory] = useState('')
  const [recurrenceFilter, setRecurrenceFilter] = useState<'all' | 'recurring' | 'one_time'>('all')

  const ofType = transactions.filter((t) => t.type === type)
  const months = Array.from(new Set(ofType.map((t) => monthKey(t.date)))).sort().reverse()
  const statusMap = type === 'receita' ? INCOME_STATUS : EXPENSE_STATUS

  const q = normalize(query.trim())
  const filtered = recentTransactions(
    ofType.filter((t) => {
      const isRec = Boolean(t.recurring || t.recurrencePeriod === 'mensal' || t.category?.toLowerCase() === 'mensalidade')
      const matchesRec =
        recurrenceFilter === 'all' ? true : recurrenceFilter === 'recurring' ? isRec : !isRec
      return (
        (!q || normalize(`${t.description} ${t.category}`).includes(q)) &&
        (!status || t.status === status) &&
        (!projectId || (projectId === '_none' ? !t.projectId : t.projectId === projectId)) &&
        (!month || monthKey(t.date) === month) &&
        (!category || t.category === category) &&
        matchesRec
      )
    }),
    Infinity,
  )

  const total = filtered.reduce((acc, t) => acc + t.amountCents, 0)

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative col-span-2 sm:w-60">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input aria-label="Buscar" className="h-8 pl-9 text-[13px]" placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select
          compact
          aria-label="Tipo de cobrança"
          value={recurrenceFilter}
          options={[
            { value: 'all', label: 'Todas as cobranças' },
            { value: 'recurring', label: type === 'receita' ? '🔁 Mensalidades (MRR)' : '🔁 Custos Recorrentes' },
            { value: 'one_time', label: type === 'receita' ? '⚡ Implementações / Pontuais' : '⚡ Despesas Pontuais' },
          ]}
          onChange={(e) => setRecurrenceFilter(e.target.value as 'all' | 'recurring' | 'one_time')}
        />
        <Select compact aria-label="Status" value={status} placeholder="Qualquer status" options={Object.entries(statusMap).map(([value, s]) => ({ value, label: s.label }))} onChange={(e) => setStatus(e.target.value)} />
        <Select
          compact
          aria-label="Projeto"
          value={projectId}
          placeholder="Todos os projetos"
          options={[...projects.map((p) => ({ value: p.id, label: p.name })), ...(type === 'despesa' ? [{ value: '_none', label: 'Geral (sem projeto)' }] : [])]}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <Select
          compact
          aria-label="Mês"
          value={month}
          placeholder="Todos os meses"
          options={months.map((m) => ({ value: m, label: `${monthLabel(m)} ${m.slice(0, 4)}` }))}
          onChange={(e) => setMonth(e.target.value)}
        />
        <Select
          compact
          aria-label="Categoria"
          value={category}
          placeholder="Todas as categorias"
          options={Array.from(new Set(ofType.map((t) => t.category))).sort().map((c) => ({ value: c, label: c }))}
          onChange={(e) => setCategory(e.target.value)}
        />
        <span className="col-span-2 text-[13px] text-muted sm:ml-auto">
          {filtered.length} lançamento{filtered.length === 1 ? '' : 's'} · <strong className="tabular font-semibold text-fg">{formatCurrency(total)}</strong>
        </span>
      </div>
      <Card className="overflow-hidden">
        <TransactionList
          transactions={filtered}
          showClient={type === 'receita'}
          emptyTitle={ofType.length ? 'Nada encontrado com esses filtros' : type === 'receita' ? 'Nenhuma receita registrada' : 'Nenhuma despesa registrada'}
          emptyAction={
            !ofType.length && (
              <Button size="sm" variant="primary" icon={Plus} onClick={onCreate}>
                {type === 'receita' ? 'Registrar receita' : 'Registrar despesa'}
              </Button>
            )
          }
        />
      </Card>
    </>
  )
}
