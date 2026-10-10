import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table'
import { LOCALE } from '@/config/app'
import { addDays, formatCurrency, formatDateShort, todayISO, toISODate } from '@/lib/format'
import { contractStatus, financeSummary } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ISODate } from '@/types'

type Mode = 'mes' | 'trimestre' | 'custom'
interface Range {
  from: ISODate
  to: ISODate
  label: string
}

function monthRange(offset: number): Range {
  const now = new Date()
  const a = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const b = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
  return { from: toISODate(a), to: toISODate(b), label: a.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' }) }
}

function quarterRange(offset: number): Range {
  const now = new Date()
  const q = Math.floor(now.getMonth() / 3) + offset
  const a = new Date(now.getFullYear(), q * 3, 1)
  const b = new Date(now.getFullYear(), q * 3 + 3, 0)
  return { from: toISODate(a), to: toISODate(b), label: `${Math.floor(a.getMonth() / 3) + 1}º tri/${a.getFullYear()}` }
}

type Metric = { label: string; a: number; b: number; money?: boolean; higherIsBetter?: boolean }

/**
 * Comparação de períodos: mostra os números e as variações, sem interpretações.
 * "A" é o período mais recente; "B" o de comparação.
 */
export function ComparisonReport() {
  const { transactions, tasks, contents, clients, contracts, projects } = useData()
  const [mode, setMode] = useState<Mode>('mes')
  const [projectId, setProjectId] = useState('')
  const today = todayISO()
  const [custom, setCustom] = useState({ aFrom: addDays(today, -29), aTo: today, bFrom: addDays(today, -59), bTo: addDays(today, -30) })

  const [A, B]: [Range, Range] =
    mode === 'mes'
      ? [monthRange(0), monthRange(-1)]
      : mode === 'trimestre'
        ? [quarterRange(0), quarterRange(-1)]
        : [
            { from: custom.aFrom, to: custom.aTo, label: `${formatDateShort(custom.aFrom)} – ${formatDateShort(custom.aTo)}` },
            { from: custom.bFrom, to: custom.bTo, label: `${formatDateShort(custom.bFrom)} – ${formatDateShort(custom.bTo)}` },
          ]

  const inR = (d: string | null | undefined, r: Range) => !!d && d.slice(0, 10) >= r.from && d.slice(0, 10) <= r.to
  const scope = <T extends { projectId: string | null }>(l: T[]) => (projectId ? l.filter((i) => i.projectId === projectId) : l)

  const compute = (r: Range) => {
    const f = financeSummary(scope(transactions).filter((t) => inR(t.date, r)))
    return {
      receita: f.receitaCents,
      despesa: f.despesaCents,
      saldo: f.saldoCents,
      tarefasCriadas: scope(tasks).filter((t) => inR(t.createdAt, r)).length,
      tarefasConcluidas: scope(tasks).filter((t) => t.status === 'concluido' && inR(t.completedAt, r)).length,
      publicados: scope(contents).filter((c) => c.status === 'publicado' && inR(c.publishDate, r)).length,
      novosClientes: (projectId ? clients.filter((c) => c.projectIds.includes(projectId)) : clients).filter((c) => inR(c.createdAt, r)).length,
      contratos: scope(contracts).filter((c) => inR(c.startDate, r) && contractStatus(c) !== 'pendente').length,
    }
  }
  const a = compute(A)
  const b = compute(B)
  const metrics: Metric[] = [
    { label: 'Receita (recebida)', a: a.receita, b: b.receita, money: true, higherIsBetter: true },
    { label: 'Despesas (pagas)', a: a.despesa, b: b.despesa, money: true, higherIsBetter: false },
    { label: 'Saldo', a: a.saldo, b: b.saldo, money: true, higherIsBetter: true },
    { label: 'Tarefas concluídas', a: a.tarefasConcluidas, b: b.tarefasConcluidas, higherIsBetter: true },
    { label: 'Tarefas criadas', a: a.tarefasCriadas, b: b.tarefasCriadas },
    { label: 'Conteúdos publicados', a: a.publicados, b: b.publicados, higherIsBetter: true },
    { label: 'Novos clientes', a: a.novosClientes, b: b.novosClientes, higherIsBetter: true },
    { label: 'Contratos iniciados', a: a.contratos, b: b.contratos, higherIsBetter: true },
  ]
  const fmt = (m: Metric, v: number) => (m.money ? formatCurrency(v) : v.toLocaleString(LOCALE))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented
          ariaLabel="Comparação"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'mes', label: 'Mês vs anterior' },
            { value: 'trimestre', label: 'Trimestre vs anterior' },
            { value: 'custom', label: 'Personalizado' },
          ]}
        />
        <Select compact aria-label="Projeto" value={projectId} placeholder="Todos os projetos" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />
      </div>
      {mode === 'custom' && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ['aFrom', 'Período A — de'],
              ['aTo', 'Período A — até'],
              ['bFrom', 'Período B — de'],
              ['bTo', 'Período B — até'],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex flex-col gap-1 text-[12px] text-subtle">
              {label}
              <Input type="date" className="h-8 text-[13px]" value={custom[k]} onChange={(e) => setCustom((c) => ({ ...c, [k]: e.target.value }))} />
            </label>
          ))}
        </div>
      )}
      <Card className="overflow-hidden">
        <Table className="min-w-[640px]">
          <THead>
            <tr>
              <Th>Indicador</Th>
              <Th className="w-40 text-right capitalize">{A.label}</Th>
              <Th className="w-40 text-right capitalize">{B.label}</Th>
              <Th className="w-36 text-right">Diferença</Th>
              <Th className="w-28 text-right">Variação</Th>
            </tr>
          </THead>
          <TBody>
            {metrics.map((m) => {
              const diff = m.a - m.b
              const pct = m.b !== 0 ? (diff / Math.abs(m.b)) * 100 : null
              const good = m.higherIsBetter === undefined || diff === 0 ? null : m.higherIsBetter ? diff > 0 : diff < 0
              const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus
              return (
                <Tr key={m.label}>
                  <Td className="font-medium">{m.label}</Td>
                  <Td className="tabular text-right">{fmt(m, m.a)}</Td>
                  <Td className="tabular text-right text-muted">{fmt(m, m.b)}</Td>
                  <Td className={cn('tabular text-right', good === true && 'text-emerald-600 dark:text-emerald-400', good === false && 'text-rose-600 dark:text-rose-400')}>
                    <span className="inline-flex items-center gap-1">
                      <Icon className="h-3.5 w-3.5" />
                      {diff > 0 ? '+' : ''}
                      {fmt(m, diff)}
                    </span>
                  </Td>
                  <Td className="tabular text-right text-muted">{pct === null ? '—' : `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`}</Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      </Card>
      <p className="text-[12px] text-subtle">Valores calculados a partir dos lançamentos e registros reais de cada período. Variação “—” quando o período de comparação é zero.</p>
    </div>
  )
}
