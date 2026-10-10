import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileX, Pencil, Trash2 } from 'lucide-react'
import { ClientLink, ProjectLink } from '@/components/common/EntityLinks'
import { ContractDueAlert, ContractStatusBadge } from '@/components/contracts/ContractList'
import { ContractFormModal } from '@/components/contracts/ContractFormModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Menu } from '@/components/ui/Menu'
import { CONTRACT_PERIODICITY } from '@/config/labels'
import { useRemove } from '@/hooks/useRemove'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
import { contractMonthlyCents } from '@/lib/selectors'
import { useData } from '@/store/useData'

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12.5px] text-subtle">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  )
}

export function ContractDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const remove = useRemove()
  const { contracts, deleteContract } = useData()
  const [editing, setEditing] = useState(false)
  const contract = contracts.find((c) => c.id === id)

  if (!contract) {
    return (
      <Card>
        <EmptyState icon={FileX} title="Contrato não encontrado" description="Ele pode ter sido excluído." action={<Button onClick={() => navigate('/contratos')}>Voltar para contratos</Button>} />
      </Card>
    )
  }

  const per = CONTRACT_PERIODICITY[contract.periodicity]
  const monthly = contractMonthlyCents(contract)

  const onDelete = async () => {
    if (await remove({ what: 'contrato', name: contract.title, action: () => deleteContract(contract.id) })) navigate('/contratos')
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Contratos', to: '/contratos' }, { label: contract.title }]}
        title={contract.title}
        meta={
          <>
            <ContractStatusBadge contract={contract} />
            {contract.isDemo && <DemoBadge />}
          </>
        }
        actions={
          <>
            <Button size="sm" icon={Pencil} onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Menu items={[{ label: 'Excluir contrato', icon: Trash2, danger: true, onSelect: onDelete }]} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-4 sm:p-6 lg:col-span-2">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Item label="Cliente">{contract.clientId ? <ClientLink id={contract.clientId} className="text-sm" /> : <span className="text-subtle">Cliente removido</span>}</Item>
            <Item label="Projeto">
              <ProjectLink id={contract.projectId} className="text-sm" />
            </Item>
            <Item label="Serviço">{contract.service || <span className="font-normal text-subtle">—</span>}</Item>
            <Item label="Periodicidade">{per.label}</Item>
            <Item label="Início">{formatDate(contract.startDate)}</Item>
            <Item label="Término">{contract.endDate ? formatDate(contract.endDate) : 'Sem término definido'}</Item>
            <Item label="Próxima renovação">
              <span className="flex flex-wrap items-center gap-2">
                {contract.nextRenewal ? formatDate(contract.nextRenewal) : '—'}
                <ContractDueAlert contract={contract} />
              </span>
            </Item>
            <Item label="Criado em">{formatDateTime(contract.createdAt)}</Item>
          </dl>
          {contract.notes && (
            <div className="mt-6 border-t border-line pt-4">
              <p className="text-[12.5px] text-subtle">Observações</p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted">{contract.notes}</p>
            </div>
          )}
        </Card>

        <Card className="h-fit p-4 sm:p-6">
          <p className="text-[13px] font-medium text-muted">Valor</p>
          <p className="tabular mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(contract.amountCents)}</p>
          <p className="text-[13px] text-subtle">{per.months ? `por ${per.label.toLowerCase() === 'mensal' ? 'mês' : 'ciclo ' + per.label.toLowerCase()}` : 'pagamento único'}</p>
          {per.months > 1 && (
            <p className="mt-3 border-t border-line pt-3 text-[13px] text-muted">
              Equivale a <strong className="tabular text-fg">{formatCurrency(monthly)}</strong>/mês
            </p>
          )}
          <p className="mt-4 rounded-lg bg-surface-2 p-3 text-[12.5px] leading-relaxed text-muted">
            Informativo: este contrato ainda não gera receitas automaticamente. Registre os recebimentos no Financeiro.
          </p>
        </Card>
      </div>

      <ContractFormModal open={editing} contract={contract} onClose={() => setEditing(false)} />
    </div>
  )
}
