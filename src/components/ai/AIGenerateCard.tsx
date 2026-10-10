import type { ReactNode } from 'react'
import { Copy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { useToast } from '@/components/ui/toastContext'
import { useAI } from '@/hooks/useAI'
import { useAIContext, type AIScopeRef } from '@/hooks/useAIContext'
import type { AITask } from '@/services/ai/types'
import { AIErrorBox, AILoading, AIResultCard } from './AIResultCard'

interface Props {
  title: ReactNode
  description?: ReactNode
  scope: AIScopeRef
  task: AITask
  /** Pedido enviado junto com o contexto. */
  prompt: string
  buttonLabel: string
  /** Conteúdo exibido antes de gerar (ex.: resumo determinístico). */
  placeholder?: ReactNode
  className?: string
}

/** Cartão de geração única ("Resumir projeto", "Preparar reunião", "Briefing do dia"). */
export function AIGenerateCard({ title, description, scope, task, prompt, buttonLabel, placeholder, className }: Props) {
  const ai = useAI()
  const buildContext = useAIContext()
  const toast = useToast()

  const generate = async () => {
    try {
      await ai.run({ task, context: await buildContext(scope), input: prompt })
    } catch {
      /* erro exibido pelo hook */
    }
  }

  return (
    <Card className={className}>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" /> {title}
          </span>
        }
        description={description}
        action={
          <Button size="sm" variant={ai.result ? 'secondary' : 'primary'} icon={Sparkles} loading={ai.loading} onClick={generate}>
            {ai.result ? 'Gerar novamente' : buttonLabel}
          </Button>
        }
      />
      <div className="border-t border-line px-4 py-4 sm:px-5">
        {ai.loading ? (
          <AILoading />
        ) : ai.error ? (
          <AIErrorBox message={ai.error} onRetry={generate} />
        ) : ai.result ? (
          <AIResultCard
            result={ai.result}
            actions={
              <Button
                size="sm"
                variant="ghost"
                icon={Copy}
                onClick={() => navigator.clipboard.writeText(ai.result!.text).then(() => toast.success('Copiado'))}
              >
                Copiar
              </Button>
            }
          />
        ) : (
          (placeholder ?? <p className="text-[13px] text-subtle">Clique em “{buttonLabel}” para gerar a partir dos dados atuais.</p>)
        )}
      </div>
    </Card>
  )
}
