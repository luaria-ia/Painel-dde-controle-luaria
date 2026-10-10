import { useEffect, useState } from 'react'
import { Check, Lightbulb, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/toastContext'
import { CONTENT_TYPE } from '@/config/labels'
import { useAI } from '@/hooks/useAI'
import { useAIContext } from '@/hooks/useAIContext'
import { cn } from '@/lib/utils'
import { SCHEMA_IDEAS } from '@/services/ai/promptBuilder'
import { useData } from '@/store/useData'
import type { ContentType, ID } from '@/types'
import { AIErrorBox, AILoading, AISourceBadge } from './AIResultCard'

interface Idea {
  selected: boolean
  title: string
  type: ContentType
  hook: string
  description: string
}

/**
 * Ideias de conteúdo com IA, usando o contexto do cliente (se escolhido) ou do projeto.
 * As ideias só viram conteúdos (status "Ideia") após o usuário selecionar e confirmar.
 */
export function ContentIdeasModal({ open, onClose, defaults }: { open: boolean; onClose: () => void; defaults?: { projectId?: ID | null; clientId?: ID | null } }) {
  const { projects, clients, createContent } = useData()
  const ai = useAI()
  const buildContext = useAIContext()
  const toast = useToast()
  const [projectId, setProjectId] = useState('')
  const [clientId, setClientId] = useState('')
  const [type, setType] = useState('')
  const [count, setCount] = useState('5')
  const [theme, setTheme] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setProjectId(defaults?.projectId ?? '')
    setClientId(defaults?.clientId ?? '')
    setIdeas([])
    ai.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const generate = async () => {
    if (!projectId && !clientId) return
    // Cliente escolhido → contexto do cliente (tom de voz, histórico); senão, do projeto.
    const context = await buildContext(clientId ? { type: 'client', id: clientId } : { type: 'project', id: projectId })
    const request = [
      `Crie ${count} ideias de conteúdo${type ? ` do tipo ${CONTENT_TYPE[type as ContentType].label}` : ''}.`,
      theme.trim() ? `Tema/objetivo: ${theme.trim()}` : '',
      'Não repita conteúdos que já existem no contexto.',
    ]
      .filter(Boolean)
      .join('\n')
    const res = await ai.run({ task: 'content_ideas', context, input: request, jsonSchema: SCHEMA_IDEAS as unknown as Record<string, unknown> })
    const list = (res?.data as { ideas?: Array<Omit<Idea, 'selected'>> } | undefined)?.ideas ?? []
    setIdeas(list.slice(0, 12).map((i) => ({ ...i, title: String(i.title).slice(0, 140), type: i.type in CONTENT_TYPE ? i.type : 'post', selected: true })))
  }

  const chosen = ideas.filter((i) => i.selected)
  const save = async () => {
    setSaving(true)
    let ok = 0
    for (const i of chosen) {
      const created = await createContent({
        title: i.title,
        description: [i.hook && `Gancho: ${i.hook}`, i.description].filter(Boolean).join('\n\n'),
        projectId: projectId || null,
        clientId: clientId || null,
        type: i.type,
        status: 'ideia',
        plannedDate: null,
        publishDate: null,
        caption: '',
        cta: '',
        notes: 'Ideia sugerida pela IA.',
      })
      if (created) ok++
    }
    setSaving(false)
    if (ok) {
      toast.success(`${ok} ideia${ok > 1 ? 's' : ''} adicionada${ok > 1 ? 's' : ''} ao Kanban`)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent" /> Ideias de conteúdo com IA
        </span>
      }
      description="Usa o conhecimento do projeto/cliente. Você escolhe o que entra no Kanban."
      footer={
        ideas.length ? (
          <>
            <Button onClick={() => setIdeas([])}>Gerar outras</Button>
            <Button variant="primary" icon={Check} loading={saving} disabled={!chosen.length} onClick={save}>
              Adicionar {chosen.length} como Ideia
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" icon={Sparkles} loading={ai.loading} disabled={!projectId && !clientId} onClick={generate}>
              Gerar ideias
            </Button>
          </>
        )
      }
    >
      {!ideas.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Projeto">
            {(id) => <Select id={id} value={projectId} placeholder="Selecione…" options={projects.map((p) => ({ value: p.id, label: p.name }))} onChange={(e) => setProjectId(e.target.value)} />}
          </Field>
          <Field label="Cliente" hint="Opcional — usa o contexto do cliente">
            {(id) => <Select id={id} value={clientId} placeholder="Nenhum" options={clients.map((c) => ({ value: c.id, label: c.name }))} onChange={(e) => setClientId(e.target.value)} />}
          </Field>
          <Field label="Tipo">
            {(id) => <Select id={id} value={type} placeholder="Variados" options={Object.entries(CONTENT_TYPE).map(([value, t]) => ({ value, label: t.label }))} onChange={(e) => setType(e.target.value)} />}
          </Field>
          <Field label="Quantidade">
            {(id) => <Select id={id} value={count} options={['3', '5', '8', '10'].map((v) => ({ value: v, label: v }))} onChange={(e) => setCount(e.target.value)} />}
          </Field>
          <Field label="Tema ou objetivo" hint="Opcional" className="sm:col-span-2">
            {(id) => <Input id={id} value={theme} maxLength={300} placeholder="Ex.: campanha de outubro, aumentar agendamentos" onChange={(e) => setTheme(e.target.value)} />}
          </Field>
          <div className="sm:col-span-2">
            {ai.loading && <AILoading label="Pensando em ideias com base no contexto…" />}
            {ai.error && <AIErrorBox message={ai.error} onRetry={generate} />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ai.result && (
            <div className="flex flex-wrap items-center gap-2">
              <AISourceBadge result={ai.result} />
              {ai.result.notice && <span className="text-[12px] text-subtle">{ai.result.notice}</span>}
            </div>
          )}
          <ul className="flex flex-col gap-2">
            {ideas.map((i, idx) => (
              <li key={idx}>
                <label className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3', i.selected ? 'border-line' : 'border-dashed border-line opacity-60')}>
                  <input
                    type="checkbox"
                    className="mt-1 accent-[var(--accent)]"
                    checked={i.selected}
                    onChange={(e) => setIdeas((list) => list.map((x, j) => (j === idx ? { ...x, selected: e.target.checked } : x)))}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-medium">{i.title}</span>
                      <Badge tone="neutral">{CONTENT_TYPE[i.type].label}</Badge>
                    </div>
                    {i.hook && <p className="mt-1 text-[12.5px] text-muted">Gancho: {i.hook}</p>}
                    {i.description && <p className="mt-0.5 text-[12.5px] text-subtle">{i.description}</p>}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}
