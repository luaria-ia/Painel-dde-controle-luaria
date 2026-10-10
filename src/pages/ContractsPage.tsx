import { useState } from 'react'
import { AlertTriangle, CircleCheck, Clock, Plus, Repeat, XCircle } from 'lucide-react'
import { ContractDueAlert, ContractList } from '@/components/contracts/ContractList'
import { ContractFormModal } from '@/components/contracts/ContractFormModal'
import { FinancialCard } from '@/components/finance/FinancialCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { Segmented } from '@/components/ui/Segmented'
import { CONTRACT_STATUS } from '@/config/labels'
import { contractStatus, contractSummary, contractsDueSoon, contractValueLabel } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ContractStatus } from '@/types'
import { Link } from 'react-router-dom'

function CountCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Clock; tone: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-4 shadow-card">
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
        <Icon className={cn('h-3.5 w-3.5', tone)} />
        {label}
      </span>
      <span className={cn('tabular mt-3 text-2xl font-semibold tracking-tight', value === 0 && 'text-subtle')}>{value}</span>
    </div>
  )
}

export function ContractsPage() {
  const { contracts, clients } = useData()
  const [status, setStatus] = useState<'todos' | ContractStatus>('todos')
  const [clientId, setClientId] = useState('')
  const [creating, setCreating] = useState(false)

  const summary = contractSummary(contracts)
  const dueSoon = contractsDueSoon(contracts)
  const filtered = contracts
    .filter((c) => (status === 'todos' || contractStatus(c) === status) && (!clientId || c.clientId === clientId))
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div>
      <PageHeader
        title="Contratos"
        description="Acordos com clientes, valores recorrentes e vencimentos."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
            Novo contrato
          </Button>
        }
      />

      <section aria-label="Resumo" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CountCard label="Ativos" value={summary.ativos} icon={CircleCheck} tone="text-emerald-500" />
        <CountCard label="Vencendo (30 dias)" value={summary.vencendo} icon={AlertTriangle} tone="text-amber-500" />
        <CountCard label="Expirados" value={summary.expirados} icon={XCircle} tone="text-rose-500" />
        <FinancialCard label="Recorrente mensal" cents={summary.mrrCents} icon={Repeat} tone="positive" hint="Soma dos contratos ativos" />
      </section>

      {dueSoon.length > 0 && (
        <Card className="mt-4 overflow-hidden border-amber-500/30">
          <CardHeader title="Atenção: vencimentos próximos" description="Contratos ativos que vencem ou renovam nos próximos 30 dias" />
          <ul className="divide-y divide-line border-t border-line">
            {dueSoon.map((c) => (
              <li key={c.id}>
                <Link to={`/contratos/${c.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 transition-colors hover:bg-surface-2/50 sm:px-5">
                  <span className="min-w-0 truncate text-[13.5px] font-medium">{c.title}</span>
                  <span className="flex items-center gap-3">
                    <span className="tabular text-[13px] text-muted">{contractValueLabel(c)}</span>
                    <ContractDueAlert contract={c} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented
          ariaLabel="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'todos', label: 'Todos', count: contracts.length },
            ...(Object.keys(CONTRACT_STATUS) as ContractStatus[]).map((s) => ({
              value: s,
              label: CONTRACT_STATUS[s].label,
              count: contracts.filter((c) => contractStatus(c) === s).length,
            })),
          ]}
        />
        <Select compact aria-label="Cliente" value={clientId} placeholder="Todos os clientes" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => setClientId(e.target.value)} />
      </div>

      <Card className="overflow-hidden">
        <ContractList
          contracts={filtered}
          emptyAction={
            contracts.length === 0 && (
              <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreating(true)}>
                Criar contrato
              </Button>
            )
          }
        />
      </Card>
      <p className="mt-3 text-[12.5px] text-subtle">
        Contratos são informativos: ainda não geram cobranças ou receitas automaticamente. Contratos ativos com término vencido aparecem como “Expirado”.
      </p>

      <ContractFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
