import { AlignLeft, CalendarClock, CheckCircle2, CheckSquare, Flag, MessageSquare, Paperclip } from 'lucide-react'
import { dueState, formatFieldValue } from '@/lib/boards'
import { formatDateShort } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BoardCard, BoardField, BoardLabel, BoardListKind } from '@/types/boards'
import { Avatar, LabelChip } from './BoardBits'

const DUE_TONE = {
  overdue: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
  today: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  soon: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  later: 'text-subtle',
  done: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
}
const PRIORITY_TONE = { urgente: 'text-rose-500', alta: 'text-orange-500', media: 'text-amber-500', baixa: 'text-subtle' }

interface Props {
  card: BoardCard
  labels: BoardLabel[]
  fields: BoardField[]
  kind: BoardListKind
  comments: number
  attachments: number
  onOpen: () => void
}

/** Face do cartão no quadro. Toda a área é um botão que abre os detalhes. */
export function BoardCardTile({ card, labels, fields, kind, comments, attachments, onOpen }: Props) {
  const cardLabels = card.labelIds.map((id) => labels.find((l) => l.id === id)).filter((l): l is BoardLabel => !!l)
  const due = dueState(card)
  const checklistDone = card.checklist.filter((i) => i.done).length
  const faceFields = fields.filter((f) => f.showOnCard && card.fields[f.key])
  const isRef = kind === 'reference'

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group flex w-full cursor-pointer flex-col gap-1.5 rounded-lg border bg-surface px-3 py-2.5 text-left shadow-card transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        card.completedAt ? 'border-line opacity-75' : 'border-line',
      )}
    >
      {cardLabels.length > 0 && (
        <span className="flex flex-wrap gap-1">
          {cardLabels.map((l) => (
            <LabelChip key={l.id} label={l} />
          ))}
        </span>
      )}
      <span className={cn('flex items-start gap-1.5 text-[13.5px] leading-snug font-medium', card.completedAt && 'text-muted')}>
        {card.completedAt && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Concluído" />}
        <span className="min-w-0 break-words">{card.title}</span>
      </span>
      {isRef && <span className="line-clamp-2 text-[12px] leading-snug text-muted">{card.description || <span className="text-subtle italic">A preencher</span>}</span>}
      {faceFields.length > 0 && (
        <span className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11.5px] text-muted">
          {faceFields.map((f) => (
            <span key={f.key}>
              <span className="text-subtle">{f.label}:</span> {formatFieldValue(f.type, card.fields[f.key])}
            </span>
          ))}
        </span>
      )}
      {(due || card.checklist.length > 0 || comments > 0 || attachments > 0 || (card.description && !isRef) || card.priority || card.assignee) && (
        <span className="mt-0.5 flex items-center gap-2 text-[11.5px] text-subtle">
          {due && card.dueDate && (
            <span className={cn('inline-flex items-center gap-1 rounded px-1 py-px font-medium', DUE_TONE[due])} title="Prazo">
              <CalendarClock className="h-3 w-3" />
              {formatDateShort(card.dueDate)}
            </span>
          )}
          {card.checklist.length > 0 && (
            <span className={cn('inline-flex items-center gap-1', checklistDone === card.checklist.length && 'text-emerald-600 dark:text-emerald-400')} title="Checklist">
              <CheckSquare className="h-3 w-3" />
              {checklistDone}/{card.checklist.length}
            </span>
          )}
          {card.description && !isRef && <AlignLeft className="h-3 w-3" aria-label="Tem descrição" />}
          {comments > 0 && (
            <span className="inline-flex items-center gap-1" title="Comentários">
              <MessageSquare className="h-3 w-3" />
              {comments}
            </span>
          )}
          {attachments > 0 && (
            <span className="inline-flex items-center gap-1" title="Anexos">
              <Paperclip className="h-3 w-3" />
              {attachments}
            </span>
          )}
          {card.priority && <Flag className={cn('h-3 w-3', PRIORITY_TONE[card.priority])} aria-label={`Prioridade ${card.priority}`} />}
          <span className="flex-1" />
          {card.assignee && <Avatar name={card.assignee} />}
        </span>
      )}
    </button>
  )
}
