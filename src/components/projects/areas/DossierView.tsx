import { useState } from 'react'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import { AutosaveStatus } from '@/components/studies/AutosaveStatus'
import { ProgressBar } from '@/components/studies/StudyUI'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useConfirm } from '@/components/ui/confirmContext'
import { Input, Textarea } from '@/components/ui/Field'
import { useAutosave } from '@/hooks/useAutosave'
import { useBoard, type BoardApi } from '@/hooks/useBoard'
import { cn } from '@/lib/utils'
import type { ID } from '@/types'
import type { BoardCard } from '@/types/boards'

/**
 * Dossiê do projeto (ex.: Estratégia do Social Media, Briefing do Web Design).
 * NÃO é Kanban: são seções permanentes, editadas como documento e salvas automaticamente.
 * (Armazenadas como cartões de uma lista de referência — por isso reaproveitam histórico e backup.)
 */
export function DossierView({ boardId, description }: { boardId: ID; description?: string }) {
  const api = useBoard(boardId)
  const [newTitle, setNewTitle] = useState('')
  if (api.status === 'loading') return <div className="h-64 animate-pulse rounded-xl bg-surface-2/60" aria-busy="true" />
  if (api.status !== 'ready' || !api.lists[0]) return <Card className="p-5 text-[13px] text-muted">Não foi possível carregar esta área. Recarregue a página.</Card>

  const listId = api.lists[0].id
  const sections = api.cards.filter((c) => c.listId === listId).sort((a, b) => a.position - b.position)
  const filled = sections.filter((s) => s.description.trim()).length

  const add = async () => {
    const t = newTitle.trim()
    if (!t) return
    if (await api.createCard(listId, t.slice(0, 300))) setNewTitle('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="min-w-56 flex-1">
          {description && <p className="text-[13.5px] text-muted">{description}</p>}
          <p className="mt-0.5 text-[12.5px] text-subtle">Informações permanentes — não passam por etapas. Tudo é salvo automaticamente.</p>
        </div>
        <div className="w-full sm:w-56">
          <div className="mb-1.5 flex justify-between text-[12.5px]">
            <span className="text-muted">Seções preenchidas</span>
            <span className="tabular font-semibold">
              {filled}/{sections.length}
            </span>
          </div>
          <ProgressBar value={sections.length ? (filled / sections.length) * 100 : 0} label="Seções preenchidas" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {sections.map((s) => (
          <DossierSection key={s.id} api={api} section={s} />
        ))}
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void add()
        }}
      >
        <Input
          value={newTitle}
          maxLength={120}
          placeholder="Nova seção (ex.: Sazonalidade)"
          aria-label="Nova seção"
          className="h-8 max-w-72 text-[13px]"
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button type="submit" size="sm" icon={Plus}>
          Adicionar seção
        </Button>
      </form>
    </div>
  )
}

function DossierSection({ api, section }: { api: BoardApi; section: BoardCard }) {
  const confirm = useConfirm()
  const text = useAutosave(section.description, (v) => api.updateCard(section.id, { description: v }))
  const done = !!text.value.trim()
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label="Preenchida" />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-subtle" aria-label="A preencher" />
        )}
        <h3 className="min-w-0 flex-1 text-[14px] font-semibold">{section.title}</h3>
        <AutosaveStatus status={text.status} savedAt={text.savedAt} />
        <button
          type="button"
          aria-label={`Remover seção ${section.title}`}
          onClick={async () => {
            if (await confirm({ title: `Remover a seção “${section.title}”?`, message: 'O texto dela será apagado.', danger: true })) void api.deleteCard(section.id)
          }}
          className="cursor-pointer text-subtle hover:text-rose-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <Textarea
        rows={4}
        maxLength={20000}
        aria-label={section.title}
        value={text.value}
        placeholder="A preencher…"
        onChange={(e) => text.onChange(e.target.value)}
        className={cn('text-[13.5px]', !done && 'bg-surface-2/40')}
      />
    </Card>
  )
}
