import { useState, type ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Pencil, Receipt, Trash2 } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { Badge, DemoBadge } from '@/components/ui/Badge'
import { useConfirm } from '@/components/ui/confirmContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { Menu } from '@/components/ui/Menu'
import { TBody, THead, Table, Td, Th, Tr } from '@/components/ui/Table'
import { useToast } from '@/components/ui/toastContext'
import { EXPENSE_STATUS, INCOME_STATUS } from '@/config/labels'
import { formatCurrency, formatDate, formatDateShort } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useData } from '@/store/useData'
import type { ExpenseStatus, IncomeStatus, Transaction } from '@/types'
import { TransactionFormModal } from './TransactionFormModal'

export function TransactionStatusBadge({ t }: { t: Transaction }) {
  const s = t.type === 'receita' ? INCOME_STATUS[t.status as IncomeStatus] : EXPENSE_STATUS[t.status as ExpenseStatus]
  if (!s) return null
  return <Badge tone={s.tone}>{s.label}</Badge>
}

function Amount({ t }: { t: Transaction }) {
  const income = t.type === 'receita'
  return (
    <span className={cn('tabular font-medium whitespace-nowrap', income ? 'text-emerald-700 dark:text-emerald-400' : 'text-fg')}>
      {income ? '+' : '−'} {formatCurrency(t.amountCents)}
    </span>
  )
}

function TypeIcon({ t }: { t: Transaction }) {
  const income = t.type === 'receita'
  const Icon = income ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
        income ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
    </span>
  )
}

interface Props {
  transactions: Transaction[]
  showProject?: boolean
  showClient?: boolean
  emptyTitle?: string
  emptyAction?: ReactNode
}

/** Lista de lançamentos (receitas e/ou despesas) com edição/exclusão embutidas. */
export function TransactionList({ transactions, showProject = true, showClient = true, emptyTitle, emptyAction }: Props) {
  const { deleteTransaction } = useData()
  const confirm = useConfirm()
  const toast = useToast()
  const [editing, setEditing] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return <EmptyState compact icon={Receipt} title={emptyTitle ?? 'Nenhum lançamento'} action={emptyAction} />
  }

  const remove = async (t: Transaction) => {
    const ok = await confirm({ title: `Excluir ${t.type}?`, message: `"${t.description}" (${formatCurrency(t.amountCents)}) será excluída.` })
    if (ok && (await deleteTransaction(t.id))) toast.success('Lançamento excluído')
  }

  const menu = (t: Transaction) => (
    <Menu
      items={[
        { label: 'Editar', icon: Pencil, onSelect: () => setEditing(t) },
        { label: 'Excluir', icon: Trash2, danger: true, onSelect: () => remove(t) },
      ]}
    />
  )

  return (
    <div className="@container">
      <div className="hidden @3xl:block">
        <Table>
          <THead>
            <tr>
              <Th>Descrição</Th>
              <Th className="w-32">Data</Th>
              <Th className="w-32">Categoria</Th>
              {showProject && <Th className="w-36">Projeto</Th>}
              {showClient && <Th className="w-36">Cliente</Th>}
              <Th className="w-28">Status</Th>
              <Th className="w-36 text-right">Valor</Th>
              <Th className="w-10" aria-label="Ações" />
            </tr>
          </THead>
          <TBody>
            {transactions.map((t) => (
              <Tr key={t.id} className="cursor-pointer" onClick={() => setEditing(t)}>
                <Td>
                  <div className="flex min-w-0 items-center gap-3">
                    <TypeIcon t={t} />
                    <span className="truncate font-medium" title={t.description}>{t.description}</span>
                    {t.isDemo && <DemoBadge />}
                  </div>
                </Td>
                <Td className="text-[13px] whitespace-nowrap text-muted">{formatDate(t.date)}</Td>
                <Td className="truncate text-[13px] text-muted">{t.category}</Td>
                {showProject && (
                  <Td className="max-w-36">
                    <ProjectLink id={t.projectId} />
                  </Td>
                )}
                {showClient && (
                  <Td className="max-w-36">
                    <ClientLink id={t.clientId} />
                  </Td>
                )}
                <Td>
                  <TransactionStatusBadge t={t} />
                </Td>
                <Td className="text-right">
                  <Amount t={t} />
                </Td>
                <Td onClick={(e) => e.stopPropagation()}>{menu(t)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      <ul className="divide-y divide-line border-t border-line @3xl:hidden">
        {transactions.map((t) => (
          <li key={t.id} className="flex cursor-pointer items-center gap-3 px-4 py-3" onClick={() => setEditing(t)}>
            <TypeIcon t={t} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.description}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-subtle">
                <span>{formatDateShort(t.date)}</span>
                <span>·</span>
                <span>{t.category}</span>
                <TransactionStatusBadge t={t} />
                {t.isDemo && <DemoBadge />}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Amount t={t} />
              <div onClick={(e) => e.stopPropagation()}>{menu(t)}</div>
            </div>
          </li>
        ))}
      </ul>

      <TransactionFormModal open={!!editing} transaction={editing} onClose={() => setEditing(null)} />
    </div>
  )
}
