import { useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, Plus, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Field'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import type { BoardApi } from '@/hooks/useBoard'
import { cardsOfList } from '@/lib/boards'
import { CRM_FIELD, sortCrm, type CrmSort, type CrmSortKey } from '@/lib/crm'
import { formatDateShort, todayISO } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ID } from '@/types'
import type { BoardCard } from '@/types/boards'
import { LabelChip } from './BoardBits'

interface Props {
  api: BoardApi
  /** Cartões já filtrados (busca + filtros) — os MESMOS do Kanban. */
  cards: BoardCard[]
  onOpenCard: (id: ID) => void
}

const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()
const cellInput =
  'h-7 w-full rounded-md border border-transparent bg-transparent px-1.5 text-[13px] outline-none transition-colors hover:border-line focus:border-accent focus:bg-surface'

/**
 * CRM em tabela: outra visualização dos mesmos registros do Kanban.
 * Status, follow-up e observação editáveis direto na linha (salvos na hora, refletem no Kanban);
 * clicar na linha abre o mesmo modal de detalhes.
 */
export function CrmTable({ api, cards, onOpenCard }: Props) {
  const [sort, setSort] = useState<CrmSort>({ key: 'firstContact', dir: 'desc' })
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const rows = sortCrm(cards, api.lists, sort)
  const listOf = (id: ID) => api.lists.find((l) => l.id === id)
  const today = todayISO()
  const statusOptions = api.board?.fields.find((x) => x.key === CRM_FIELD.status)?.options ?? []

  const toggleSort = (key: CrmSortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'firstContact' || key === 'followUp' ? 'desc' : 'asc' }))

  const add = async () => {
    // Sem nome também cria: dá para começar só com a empresa e completar depois.
    const n = name.trim() || 'Novo lead'
    const first = [...api.lists].sort((a, b) => a.position - b.position)[0]
    if (!first) return
    const created = await api.createCard(first.id, n.slice(0, 300))
    setName('')
    setAdding(false)
    // Data do primeiro contato fica vazia: só é preenchida quando o contato acontecer.
    if (created) onOpenCard(created.id)
  }

  const th = { sort, onSort: toggleSort }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
        <p className="text-[13px] text-muted">
          {rows.length} {rows.length === 1 ? 'lead' : 'leads'} · clique numa linha para abrir os detalhes
        </p>
        {adding ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void add()
            }}
          >
            <Input
              autoFocus
              value={name}
              maxLength={300}
              placeholder="Nome do contato (opcional)"
              aria-label="Nome do novo lead"
              className="h-8 w-56 text-[13px]"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
            />
            <Button type="submit" size="sm" variant="primary">
              Adicionar
            </Button>
          </form>
        ) : (
          <Button size="sm" variant="primary" icon={Plus} onClick={() => setAdding(true)}>
            Novo lead
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          compact
          icon={Users}
          title={api.cards.length ? 'Nenhum lead com esses filtros' : 'Nenhum lead ainda'}
          description={api.cards.length ? undefined : 'Cadastre o primeiro interessado — ele aparece também no Kanban.'}
        />
      ) : (
        <Table className="min-w-[1420px]">
          <colgroup>
            <col className="w-[96px]" />
            <col className="w-[170px]" />
            <col className="w-[150px]" />
            <col className="w-[130px]" />
            <col className="w-[120px]" />
            <col className="w-[110px]" />
            <col className="w-[120px]" />
            <col className="w-[170px]" />
            <col className="w-[150px]" />
            <col className="w-[170px]" />
            <col className="w-[200px]" />
            <col className="w-[140px]" />
          </colgroup>
          <THead>
            <tr>
              <SortTh {...th} k="firstContact">
                Data
              </SortTh>
              <SortTh {...th} k="company">
                Empresa
              </SortTh>
              <SortTh {...th} k="name">
                Nome do contato
              </SortTh>
              <Th>WhatsApp</Th>
              <Th>Instagram</Th>
              <SortTh {...th} k="segment">
                Segmento
              </SortTh>
              <Th>Cidade</Th>
              <Th>Problema</Th>
              <SortTh {...th} k="stage">
                Etapa
              </SortTh>
              <SortTh {...th} k="status">
                Status
              </SortTh>
              <Th>Observação</Th>
              <SortTh {...th} k="followUp">
                Follow-up
              </SortTh>
            </tr>
          </THead>
          <TBody>
            {rows.map((card) => {
              const f = card.fields
              const list = listOf(card.listId)
              const fu = f[CRM_FIELD.followUp] ?? ''
              const labels = api.labels.filter((l) => card.labelIds.includes(l.id))
              return (
                <Tr
                  key={card.id}
                  tabIndex={0}
                  onClick={() => onOpenCard(card.id)}
                  onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && onOpenCard(card.id)}
                  className="cursor-pointer text-[13px] focus-visible:bg-surface-2/60 focus-visible:outline-none"
                >
                  <Td className="tabular text-muted">{f[CRM_FIELD.firstContact] ? formatDateShort(f[CRM_FIELD.firstContact]) : '—'}</Td>
                  <Td className="truncate font-medium" title={f.empresa}>
                    {f.empresa || <span className="text-subtle">—</span>}
                  </Td>
                  <Td>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate" title={card.title}>
                        {card.title}
                      </span>
                      {card.clientId && <UserCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Convertido em cliente" />}
                    </span>
                    {labels.length > 0 && (
                      <span className="mt-0.5 flex flex-wrap gap-1">
                        {labels.map((l) => (
                          <LabelChip key={l.id} label={l} />
                        ))}
                      </span>
                    )}
                  </Td>
                  <Td className="truncate tabular text-muted">{f.whatsapp || '—'}</Td>
                  <Td className="truncate text-muted">{f.instagram || '—'}</Td>
                  <Td className="truncate">{f[CRM_FIELD.segment] || <span className="text-subtle">—</span>}</Td>
                  <Td className="truncate text-muted">{f[CRM_FIELD.city] || '—'}</Td>
                  <Td className="truncate text-muted" title={f.problema}>
                    {f.problema || '—'}
                  </Td>
                  <Td onClick={stop}>
                    <select
                      aria-label={`Etapa de ${card.title}`}
                      value={card.listId}
                      onChange={(e) => void api.moveCard(card.id, e.target.value, cardsOfList(api.cards, e.target.value).length)}
                      className={cn(cellInput, 'cursor-pointer appearance-none bg-surface-2/60 pr-1 font-medium')}
                    >
                      {api.lists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {`${l.icon} ${l.name}`.trim()}
                        </option>
                      ))}
                    </select>
                    {list?.templateKey === 'fechados' && !card.clientId && <span className="mt-0.5 block px-1.5 text-[11px] text-accent">Converter em cliente →</span>}
                  </Td>
                  <Td onClick={stop}>
                    {statusOptions.length > 0 ? (
                      <select
                        aria-label={`Status de ${card.title}`}
                        value={f[CRM_FIELD.status] ?? ''}
                        onChange={(e) => void api.updateFields(card.id, { [CRM_FIELD.status]: e.target.value })}
                        className={cn(cellInput, 'cursor-pointer appearance-none pr-1', !f[CRM_FIELD.status] && 'text-subtle')}
                      >
                        <option value="">—</option>
                        {statusOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-1.5 text-subtle">—</span>
                    )}
                  </Td>
                  <Td onClick={stop}>
                    <NoteCell card={card} api={api} />
                  </Td>
                  <Td onClick={stop}>
                    <input
                      type="date"
                      aria-label={`Próximo follow-up de ${card.title}`}
                      value={fu}
                      onChange={(e) => void api.updateFields(card.id, { [CRM_FIELD.followUp]: e.target.value })}
                      className={cn(
                        cellInput,
                        'tabular',
                        fu && fu < today && !card.completedAt && 'text-rose-600 dark:text-rose-400',
                        fu === today && 'text-amber-700 dark:text-amber-300',
                      )}
                    />
                  </Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      )}
    </Card>
  )
}

/** Observação = descrição do cartão. Edita a primeira linha direto na tabela; texto de várias linhas só no modal. */
function NoteCell({ card, api }: { card: BoardCard; api: BoardApi }) {
  const multiline = card.description.includes('\n')
  const [value, setValue] = useState(card.description)
  const [base, setBase] = useState(card.description)
  // Recebe alterações vindas do modal/Kanban sem perder o que está sendo digitado.
  if (card.description !== base) {
    setBase(card.description)
    setValue(card.description)
  }
  if (multiline)
    return (
      <span className="block truncate px-1.5 text-muted" title={card.description}>
        {card.description.split('\n')[0]}…
      </span>
    )
  return (
    <input
      aria-label={`Observação de ${card.title}`}
      value={value}
      maxLength={20000}
      placeholder="Adicionar…"
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => value !== card.description && void api.updateCard(card.id, { description: value })}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className={cn(cellInput, 'placeholder:text-subtle')}
    />
  )
}

function SortTh({ k, sort, onSort, children }: { k: CrmSortKey; sort: CrmSort; onSort: (k: CrmSortKey) => void; children: ReactNode }) {
  const active = sort.key === k
  const Icon = active ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown
  return (
    <Th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => onSort(k)} className={cn('inline-flex cursor-pointer items-center gap-1 uppercase hover:text-fg', active && 'text-fg')}>
        {children}
        <Icon className={cn('h-3 w-3', !active && 'opacity-50')} />
      </button>
    </Th>
  )
}
