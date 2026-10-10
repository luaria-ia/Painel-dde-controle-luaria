import { useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { AssistantPanel } from '@/components/ai/AssistantPanel'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import type { AIScopeRef } from '@/hooks/useAIContext'
import { useData } from '@/store/useData'

const SUGGESTIONS = {
  project: [
    'Resuma o estado atual do projeto',
    'Elabore um diagnóstico deste projeto',
    'Gere um plano estratégico para os próximos 30 dias',
    'Sugira ideias de campanha para este projeto',
    'Monte uma sugestão de calendário editorial',
    'Quais são minhas prioridades?',
    'Existem tarefas atrasadas?',
    'Analise o financeiro',
    'Sugira melhorias práticas para a operação',
  ],
  client: [
    'Resuma o relacionamento com este cliente',
    'Prepare um resumo para a próxima reunião',
    'Estruture uma proposta comercial para este cliente',
    'Gere um roteiro completo de gravação para o nicho dele',
    'Escreva uma legenda atraente para o próximo post',
    'Gere um modelo de briefing para este nicho',
    'Quais contratos estão ativos?',
    'O que está pendente com este cliente?',
  ],
  finance: ['Resuma meu financeiro deste mês', 'Quais projetos tiveram maior receita?', 'Quais são minhas maiores despesas?', 'Quanto tenho a receber?', 'Compare este mês com o mês anterior'],
  overview: ['O que eu deveria fazer hoje?', 'Quais são as prioridades da semana?', 'Existe algo atrasado ou vencendo?', 'Sugira melhorias gerais para o negócio'],
}

/**
 * Assistente com escolha explícita de escopo. Cada escopo envia só os seus dados:
 * um projeto não "enxerga" outro.
 */
export function AssistantPage() {
  const { projects, clients, projectById, clientById } = useData()
  const [params, setParams] = useSearchParams()
  const value = params.get('escopo') ?? (projects[0] ? `project:${projects[0].id}` : 'overview')
  const [kind, id] = value.split(':')

  const scope: AIScopeRef =
    kind === 'project' && id && projectById.has(id)
      ? { type: 'project', id }
      : kind === 'client' && id && clientById.has(id)
        ? { type: 'client', id }
        : kind === 'finance'
          ? { type: 'finance' }
          : { type: 'overview' }
  const label =
    scope.type === 'project' ? projectById.get(scope.id)!.name : scope.type === 'client' ? clientById.get(scope.id)!.name : scope.type === 'finance' ? 'Financeiro (todos os projetos)' : 'Visão geral do dia'

  const options = [
    { value: 'overview', label: 'Visão geral do dia' },
    { value: 'finance', label: 'Financeiro (todos os projetos)' },
    ...projects.map((p) => ({ value: `project:${p.id}`, label: `Projeto: ${p.name}` })),
    ...clients.map((c) => ({ value: `client:${c.id}`, label: `Cliente: ${c.name}` })),
  ]

  return (
    <div>
      <PageHeader title="Assistente" description="Pergunte sobre seus projetos, clientes e finanças. A IA usa somente os dados do contexto escolhido." />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="text-[13px] font-medium text-muted" htmlFor="ai-scope">
          Contexto
        </label>
        <Select id="ai-scope" className="sm:w-80" value={value} options={options} onChange={(e) => setParams({ escopo: e.target.value }, { replace: true })} />
      </div>

      <AssistantPanel
        key={value}
        scope={scope}
        scopeLabel={label}
        task={scope.type === 'finance' ? 'finance_analysis' : 'chat'}
        suggestions={SUGGESTIONS[scope.type]}
        tall
      />

      <Card className="mt-4 flex items-start gap-3 p-4 text-[12.5px] leading-relaxed text-muted">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          Privacidade: cada conversa envia apenas o contexto selecionado (sem e-mails ou telefones de clientes). O assistente não altera dados — sugestões são apenas
          recomendações. Use “Ver contexto” para conferir exatamente o que foi enviado.
        </p>
      </Card>
    </div>
  )
}
