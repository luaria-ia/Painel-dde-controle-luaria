import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FileSignature } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table'
import { CONTRACT_STATUS } from '@/config/labels'
import { daysFromToday, formatDate, formatDateShort } from '@/lib/format'
import { CONTRACT_ALERT_DAYS, contractDueDate, contractStatus, contractValueLabel } from '@/lib/selectors'
import { cn } from '@/lib/utils'
import type { Contract } from '@/types'

export function ContractStatusBadge({ contract }: { contract: Contract }) {
  const s = CONTRACT_STATUS[contractStatus(contract)]
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  )
}

/** "Vence em X dias" para contratos ativos próximos do vencimento/renovação. */
export function ContractDueAlert({ contract, className }: { contract: Contract; className?: string }) {
  const due = contractDueDate(contract)
  if (!due || contractStatus(contract) !== 'ativo') return null
  const days = daysFromToday(due)
  if (days < 0 || days > CONTRACT_ALERT_DAYS) return null
  const label = contract.nextRenewal ? 'Renova' : 'Vence'
  const text = days === 0 ? `${label} hoje` : days === 1 ? `${label} amanhã` : `${label} em ${days} dias`
  return (
    <span className={cn('inline-flex items-center gap-1 text-[12px] font-medium whitespace-nowrap', days <= 7 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400', className)}>
      <AlertTriangle className="h-3.5 w-3.5" />
      {text}
    </span>
  )
}

function Period({ c }: { c: Contract }) {
  return (
    <span className="text-[13px] whitespace-nowrap text-muted">
      {formatDateShort(c.startDate)} → {c.endDate ? formatDateShort(c.endDate) : 'sem término'}
    </span>
  )
}

export function ContractList({ contracts, showClient = true, emptyAction }: { contracts: Contract[]; showClient?: boolean; emptyAction?: React.ReactNode }) {
  const navigate = useNavigate()
  if (contracts.length === 0) {
    return <EmptyState compact icon={FileSignature} title="Nenhum contrato" description="Registre contratos para acompanhar valores e vencimentos." action={emptyAction} />
  }
  const open = (c: Contract) => navigate(`/contratos/${c.id}`)

  return (
    <div className="@container">
      <div className="hidden @3xl:block">
        <Table>
          <THead>
            <tr>
              <Th>Contrato</Th>
              {showClient && <Th className="w-40">Cliente</Th>}
              <Th className="w-36">Projeto</Th>
              <Th className="w-44">Período</Th>
              <Th className="w-36">Status</Th>
              <Th className="w-40 text-right">Valor</Th>
            </tr>
          </THead>
          <TBody>
            {contracts.map((c) => (
              <Tr key={c.id} className="cursor-pointer" onClick={() => open(c)}>
                <Td>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{c.title}</span>
                      {c.isDemo && <DemoBadge />}
                    </div>
                    <div className="flex items-center gap-3">
                      {c.service && <span className="truncate text-[12px] text-subtle">{c.service}</span>}
                      <ContractDueAlert contract={c} />
                    </div>
                  </div>
                </Td>
                {showClient && (
                  <Td className="max-w-40">
                    <ClientLink id={c.clientId} />
                  </Td>
                )}
                <Td className="max-w-36">
                  <ProjectLink id={c.projectId} />
                </Td>
                <Td>
                  <Period c={c} />
                </Td>
                <Td>
                  <ContractStatusBadge contract={c} />
                </Td>
                <Td className="tabular text-right font-medium whitespace-nowrap">{contractValueLabel(c)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      <ul className="divide-y divide-line border-t border-line @3xl:hidden">
        {contracts.map((c) => (
          <li key={c.id} className="flex cursor-pointer flex-col gap-1.5 px-4 py-3" onClick={() => open(c)}>
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-sm font-medium">{c.title}</p>
              <span className="tabular shrink-0 text-[13px] font-medium">{contractValueLabel(c)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {showClient && c.clientId && <ClientLink id={c.clientId} />}
              <span className="text-[12px] text-subtle" title={formatDate(c.startDate)}>
                {formatDateShort(c.startDate)} → {c.endDate ? formatDateShort(c.endDate) : 'sem término'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ContractStatusBadge contract={c} />
              <ContractDueAlert contract={c} />
              {c.isDemo && <DemoBadge />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
