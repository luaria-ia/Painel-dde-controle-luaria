import { useState } from 'react'
import { Plus, Trash2, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/confirmContext'
import { Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Segmented } from '@/components/ui/Segmented'
import type { BoardApi } from '@/hooks/useBoard'
import { LABEL_COLORS } from '@/lib/boards'
import { cn } from '@/lib/utils'
import type { BoardField, BoardFieldType, LabelColor } from '@/types/boards'
import { LabelChip } from './BoardBits'

export type SettingsTab = 'etiquetas' | 'campos' | 'automacoes'

const FIELD_TYPES: Record<BoardFieldType, string> = {
  text: 'Texto',
  textarea: 'Texto longo',
  number: 'Número',
  currency: 'Valor (R$)',
  date: 'Data',
  select: 'Lista de opções',
  url: 'Link',
  email: 'E-mail',
  phone: 'Telefone',
}

export function BoardSettingsModal({ api, tab, onTab, onClose }: { api: BoardApi; tab: SettingsTab | null; onTab: (t: SettingsTab) => void; onClose: () => void }) {
  return (
    <Modal open={!!tab} onClose={onClose} size="lg" title="Configurar quadro" description={api.board?.name}>
      <Segmented
        className="mb-4"
        ariaLabel="Configurações do quadro"
        value={tab ?? 'etiquetas'}
        onChange={onTab}
        options={[
          { value: 'etiquetas', label: 'Etiquetas', count: api.labels.length },
          { value: 'campos', label: 'Campos', count: api.board?.fields.length },
          { value: 'automacoes', label: 'Automações', count: api.board?.automations.length },
        ]}
      />
      {tab === 'etiquetas' && <LabelsEditor api={api} />}
      {tab === 'campos' && <FieldsManager api={api} />}
      {tab === 'automacoes' && <AutomationsView api={api} />}
    </Modal>
  )
}

function ColorPicker({ value, onChange }: { value: LabelColor; onChange: (c: LabelColor) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Cor">
      {(Object.keys(LABEL_COLORS) as LabelColor[]).map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={LABEL_COLORS[c].name}
          title={LABEL_COLORS[c].name}
          onClick={() => onChange(c)}
          className={cn(
            'h-6 w-6 cursor-pointer rounded-full ring-offset-2 ring-offset-surface',
            LABEL_COLORS[c].bar,
            value === c ? 'ring-2 ring-fg/60' : 'opacity-70 hover:opacity-100',
          )}
        />
      ))}
    </div>
  )
}

function LabelsEditor({ api }: { api: BoardApi }) {
  const confirm = useConfirm()
  const [name, setName] = useState('')
  const [color, setColor] = useState<LabelColor>('sky')
  const add = async () => {
    const n = name.trim()
    if (!n) return
    if (await api.createLabel({ name: n.slice(0, 40), color })) setName('')
  }
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {api.labels.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line px-3 py-2">
            <LabelChip label={l} className="text-[12px]" />
            <Input
              defaultValue={l.name}
              maxLength={40}
              aria-label="Nome da etiqueta"
              className="h-8 max-w-48 flex-1 text-[13px]"
              onBlur={(e) => {
                const n = e.target.value.trim()
                if (n && n !== l.name) void api.updateLabel(l.id, { name: n })
              }}
            />
            <ColorPicker value={l.color} onChange={(c) => void api.updateLabel(l.id, { color: c })} />
            <Button
              size="icon"
              variant="ghost"
              icon={Trash2}
              aria-label={`Excluir ${l.name}`}
              onClick={async () => {
                if (await confirm({ title: `Excluir a etiqueta “${l.name}”?`, message: 'Ela será removida de todos os cartões.', danger: true })) void api.deleteLabel(l.id)
              }}
            />
          </li>
        ))}
      </ul>
      <form
        className="flex flex-wrap items-center gap-3 border-t border-line pt-4"
        onSubmit={(e) => {
          e.preventDefault()
          void add()
        }}
      >
        <Input value={name} maxLength={40} placeholder="Nova etiqueta" aria-label="Nova etiqueta" className="h-8 max-w-48 text-[13px]" onChange={(e) => setName(e.target.value)} />
        <ColorPicker value={color} onChange={setColor} />
        <Button type="submit" size="sm" icon={Plus}>
          Adicionar
        </Button>
      </form>
      <p className="text-[12.5px] text-subtle">Automações usam o nome da etiqueta (ex.: “Aguardando cliente”, “Follow-up”). Se renomear, a automação deixa de encontrá-la.</p>
    </div>
  )
}

const slugKey = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || 'campo'

function FieldsManager({ api }: { api: BoardApi }) {
  const confirm = useConfirm()
  const fields = api.board?.fields ?? []
  const [label, setLabel] = useState('')
  const [type, setType] = useState<BoardFieldType>('text')
  const [options, setOptions] = useState('')
  const save = (next: BoardField[]) => void api.updateBoard({ fields: next })

  const add = () => {
    const l = label.trim()
    if (!l) return
    let key = slugKey(l)
    while (fields.some((f) => f.key === key)) key = `${key}_2`
    const opts =
      type === 'select'
        ? options
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
            .slice(0, 30)
        : undefined
    save([...fields, { key, label: l.slice(0, 60), type, options: opts }])
    setLabel('')
    setOptions('')
  }

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && <p className="text-[13px] text-subtle">Nenhum campo personalizado neste quadro.</p>}
      <ul className="flex flex-col gap-2">
        {fields.map((f) => (
          <li key={f.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-line px-3 py-2 text-[13.5px]">
            <span className="min-w-0 flex-1 font-medium">{f.label}</span>
            <Badge>{FIELD_TYPES[f.type]}</Badge>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12.5px] text-muted">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={!!f.showOnCard}
                onChange={(e) => save(fields.map((x) => (x.key === f.key ? { ...x, showOnCard: e.target.checked } : x)))}
              />
              Mostrar no cartão
            </label>
            <Button
              size="icon"
              variant="ghost"
              icon={Trash2}
              aria-label={`Remover ${f.label}`}
              onClick={async () => {
                if (
                  await confirm({ title: `Remover o campo “${f.label}”?`, message: 'Os valores já preenchidos ficam guardados nos cartões, mas deixam de aparecer.', danger: true })
                )
                  save(fields.filter((x) => x.key !== f.key))
              }}
            />
          </li>
        ))}
      </ul>
      <form
        className="flex flex-col gap-2 border-t border-line pt-4"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <div className="flex flex-wrap gap-2">
          <Input
            value={label}
            maxLength={60}
            placeholder="Nome do campo"
            aria-label="Nome do campo"
            className="h-8 max-w-56 text-[13px]"
            onChange={(e) => setLabel(e.target.value)}
          />
          <Select
            compact
            aria-label="Tipo do campo"
            value={type}
            options={Object.entries(FIELD_TYPES).map(([value, l]) => ({ value, label: l }))}
            onChange={(e) => setType(e.target.value as BoardFieldType)}
          />
          <Button type="submit" size="sm" icon={Plus}>
            Adicionar campo
          </Button>
        </div>
        {type === 'select' && (
          <Input value={options} placeholder="Opções separadas por vírgula" aria-label="Opções" className="h-8 text-[13px]" onChange={(e) => setOptions(e.target.value)} />
        )}
      </form>
    </div>
  )
}

function AutomationsView({ api }: { api: BoardApi }) {
  const rules = api.board?.automations ?? []
  const toggle = (id: string, enabled: boolean) => void api.updateBoard({ automations: rules.map((r) => (r.id === id ? { ...r, enabled } : r)) })
  return (
    <div className="flex flex-col gap-3">
      {rules.length === 0 && <p className="text-[13px] text-subtle">Este quadro não tem automações.</p>}
      <ul className="flex flex-col gap-2">
        {rules.map((r) => {
          const soon = r.when.type === 'date_reached'
          return (
            <li key={r.id} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
              <Zap className={cn('h-4 w-4 shrink-0', r.enabled && !soon ? 'text-amber-500' : 'text-subtle')} />
              <span className="min-w-0 flex-1 text-[13.5px]">{r.name}</span>
              {soon ? (
                <Badge>Em breve</Badge>
              ) : (
                <label className="flex cursor-pointer items-center gap-1.5 text-[12.5px] text-muted">
                  <input type="checkbox" className="accent-[var(--accent)]" checked={r.enabled} onChange={(e) => toggle(r.id, e.target.checked)} />
                  Ativa
                </label>
              )}
            </li>
          )
        })}
      </ul>
      <p className="text-[12.5px] text-subtle">
        As automações rodam quando um cartão entra numa lista ou recebe uma etiqueta. Alertas por data serão ativados numa próxima versão.
      </p>
    </div>
  )
}
