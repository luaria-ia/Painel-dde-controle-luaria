import { useState } from 'react'
import { Check, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAI } from '@/hooks/useAI'
import { useAIContext } from '@/hooks/useAIContext'
import type { ID } from '@/types'
import { AIErrorBox, AILoading, AISourceBadge } from './AIResultCard'

export type AssistField = 'caption' | 'cta' | 'description' | 'hook'

const REQUESTS: Record<AssistField, { label: string; prompt: string }> = {
  description: { label: 'Roteiro', prompt: 'Escreva um roteiro/briefing objetivo para este conteúdo (cenas ou estrutura em tópicos, gancho inicial e fechamento).' },
  caption: { label: 'Legenda', prompt: 'Escreva a legenda/copy deste conteúdo, com gancho forte na primeira linha, texto escaneável e até 3 hashtags relevantes.' },
  cta: { label: 'CTA', prompt: 'Sugira um CTA curto (até 12 palavras) adequado a este conteúdo e público.' },
  hook: { label: 'Gancho (Hook)', prompt: 'Sugira 3 ganchos de alto impacto para os primeiros 3 segundos ou linha inicial deste conteúdo.' },
}

interface Props {
  projectId: ID | null
  clientId: ID | null
  draft: { title: string; type: string; description: string; caption: string }
  onApply: (field: AssistField, text: string) => void
}

/**
 * Assistência de IA dentro do formulário de conteúdo. A sugestão só entra no campo
 * quando o usuário clica em "Usar" — e o conteúdo só é salvo quando ele salvar o formulário.
 */
export function ContentAssist({ projectId, clientId, draft, onApply }: Props) {
  const ai = useAI()
  const buildContext = useAIContext()
  const [field, setField] = useState<AssistField | null>(null)
  const disabled = !projectId && !clientId

  const run = async (f: AssistField) => {
    setField(f)
    const context = await buildContext(clientId ? { type: 'client', id: clientId } : { type: 'project', id: projectId! })
    const input = `${REQUESTS[f].prompt}\n\nConteúdo: "${draft.title || '(sem título)'}" — tipo ${draft.type}.${draft.description ? `\nRoteiro/descrição atual: ${draft.description}` : ''}${f === 'cta' && draft.caption ? `\nLegenda: ${draft.caption}` : ''}`
    await ai.run({ task: 'content_assist', context, input })
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed border-line-strong p-3 sm:col-span-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> Assistente
        </span>
        {(Object.keys(REQUESTS) as AssistField[]).map((f) => (
          <Button key={f} size="sm" variant="secondary" disabled={disabled || ai.loading} loading={ai.loading && field === f} onClick={() => run(f)}>
            {REQUESTS[f].label}
          </Button>
        ))}
        {disabled && <span className="text-[12px] text-subtle">Escolha um projeto ou cliente para usar o contexto.</span>}
      </div>
      {ai.loading && <AILoading label="Escrevendo com base no contexto…" />}
      {ai.error && <AIErrorBox message={ai.error} onRetry={() => field && run(field)} />}
      {ai.result && field && !ai.loading && (
        <div className="flex flex-col gap-2 rounded-md bg-surface-2/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <AISourceBadge result={ai.result} />
            <span className="text-[12px] text-subtle">Sugestão para: {REQUESTS[field].label}</span>
          </div>
          <p className="text-[13px] whitespace-pre-wrap text-fg">{ai.result.text}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={Check}
              onClick={() => {
                onApply(field, ai.result!.text)
                ai.reset()
              }}
            >
              Usar no campo
            </Button>
            <Button size="sm" variant="ghost" icon={X} onClick={ai.reset}>
              Descartar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
