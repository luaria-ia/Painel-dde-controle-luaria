import { formatCurrency, formatDate } from '@/lib/format'
import type { AIProvider, AIRequest, AIResult, ContextFacts } from '../types'

/**
 * Provedor de DEMONSTRAÇÃO: monta respostas por regras a partir dos fatos já calculados.
 * Não é IA — toda resposta é marcada como demonstração na interface.
 * Útil para usar o sistema sem chave configurada e para desenvolvimento.
 */

const brl = formatCurrency
const NOTICE = 'Modo demonstração: resposta montada por regras a partir dos seus dados, não por IA.'

function taskLines(f: ContextFacts) {
  const t = f.tasks
  if (!t) return ['Sem dados de tarefas.']
  const lines = [`**${t.total}** tarefas · ${t.pending} pendentes · ${t.inProgress} em andamento · ${t.done} concluídas · **${t.overdue.length} atrasadas**.`]
  if (t.overdue.length) lines.push('Atrasadas: ' + t.overdue.map((x) => `${x.title} (${formatDate(x.due)})`).join('; ') + '.')
  return lines
}

function financeLines(f: ContextFacts) {
  const fin = f.finance
  if (!fin) return ['Sem dados financeiros.']
  const m = fin.month
  const p = fin.prevMonth
  const diff = m.receita - p.receita
  return [
    `${fin.monthLabel}: receita ${brl(m.receita)}, despesas ${brl(m.despesa)}, saldo ${brl(m.saldo)}.`,
    `${fin.prevMonthLabel}: receita ${brl(p.receita)} — diferença de ${diff >= 0 ? '+' : ''}${brl(diff)} na receita.`,
    `A receber: ${brl(fin.total.aReceber)}${fin.total.atrasado ? ` (atrasado: ${brl(fin.total.atrasado)})` : ''} · a pagar: ${brl(fin.total.aPagar)}.`,
  ]
}

function nextSteps(f: ContextFacts) {
  const steps: string[] = []
  if (f.tasks?.overdue.length) steps.push(`Resolver ou reprogramar as ${f.tasks.overdue.length} tarefas atrasadas, começando por "${f.tasks.overdue[0].title}".`)
  if (f.contents?.approval.length) steps.push(`Cobrar a aprovação de ${f.contents.approval.length} conteúdo(s): ${f.contents.approval.slice(0, 2).join(', ')}.`)
  if (f.contracts?.dueSoon.length) steps.push(`Revisar o contrato "${f.contracts.dueSoon[0].title}" (vence em ${f.contracts.dueSoon[0].days} dias).`)
  if (f.finance?.total.atrasado) steps.push(`Acompanhar recebimentos atrasados (${brl(f.finance.total.atrasado)}).`)
  if (f.tasks?.next.length) steps.push(`Avançar em "${f.tasks.next[0].title}".`)
  return steps.length ? steps : ['Nenhuma pendência crítica encontrada nos dados.']
}

function answer(req: AIRequest): AIResult {
  const f = req.context.facts
  const list = (xs: string[]) => xs.map((x) => `- ${x}`).join('\n')
  switch (req.task) {
    case 'project_summary':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Status do projeto — ${f.name}`,
          ...taskLines(f),
          f.events?.length ? `\n### Próximos eventos\n${list(f.events.map((e) => `${formatDate(e.date)}${e.time ? ' ' + e.time : ''} — ${e.title}`))}` : '',
          `\n### Financeiro\n${list(financeLines(f))}`,
          f.contents ? `\n### Conteúdos\n${Object.entries(f.contents.byStatus).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'Nenhum conteúdo.'}` : '',
          f.contracts ? `\n### Contratos\n${f.contracts.active} ativo(s) · recorrente ${brl(f.contracts.mrr)}/mês.` : '',
          `\n### Próximos passos (sugestões)\n${list(nextSteps(f))}`,
        ]
          .filter(Boolean)
          .join('\n'),
      }
    case 'daily_briefing': {
      const t = f.tasks
      const items = [
        `${t?.today.length ?? 0} tarefa(s) vencendo hoje`,
        `${t?.overdue.length ?? 0} tarefa(s) atrasada(s)`,
        `${f.events?.length ?? 0} evento(s) nos próximos dias`,
        `${f.contents?.approval.length ?? 0} conteúdo(s) em aprovação`,
        `${brl(f.finance?.total.aReceber ?? 0)} a receber`,
      ]
      return { source: 'demo', notice: NOTICE, text: `Hoje você possui:\n${list(items)}\n\n**Sugestão de prioridade:** ${nextSteps(f)[0]}` }
    }
    case 'finance_analysis':
      return { source: 'demo', notice: NOTICE, text: `### ${f.name}\n${list(financeLines(f))}${f.finance?.byProject.length ? `\n\n**Maior receita:** ${f.finance.byProject[0].name} (${brl(f.finance.byProject[0].receita)}).` : ''}${f.finance?.topExpenseCategories.length ? `\n**Maior despesa:** ${f.finance.topExpenseCategories[0].name} (${brl(f.finance.topExpenseCategories[0].value)}).` : ''}` }
    case 'client_brief':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [`### ${f.name}`, ...taskLines(f), f.contracts ? `Contratos ativos: ${f.contracts.active} · ${brl(f.contracts.mrr)}/mês.` : '', ...financeLines(f), `\n**Pontos para a conversa**\n${list(nextSteps(f))}`].filter(Boolean).join('\n'),
      }
    case 'briefing_to_tasks': {
      const base = ['Definir objetivo e público', 'Criar conceito', 'Criar roteiro', 'Produzir peças', 'Enviar para aprovação', 'Agendar publicação']
      const subject = req.input.split(/[.\n]/)[0].slice(0, 60)
      return {
        source: 'demo',
        notice: NOTICE,
        text: 'Sugestão de tarefas (demonstração).',
        data: { tasks: base.map((title, i) => ({ title: `${title} — ${subject}`, description: '', priority: i === 0 ? 'alta' : 'media', due_in_days: (i + 1) * 2 })) },
      }
    }
    case 'content_ideas': {
      const kinds = ['reel', 'carrossel', 'post', 'story', 'reel'] as const
      const topics = ['Bastidores', 'Mitos e verdades', 'Pergunta frequente', 'Antes e depois do processo', 'Dica rápida']
      return {
        source: 'demo',
        notice: NOTICE,
        text: 'Ideias de exemplo (demonstração).',
        data: { ideas: topics.map((t, i) => ({ title: `${t} — ${f.name}`, type: kinds[i], hook: 'Gancho de exemplo para os 3 primeiros segundos.', description: 'Ideia gerada por modelo fixo no modo demonstração.' })) },
      }
    }
    case 'content_assist':
      return { source: 'demo', notice: NOTICE, text: `[Exemplo] Texto para "${req.input.slice(0, 80)}" — configure a IA para gerar uma versão real usando o contexto do projeto.` }
    case 'diagnostic':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Diagnóstico Estratégico — ${f.name}`,
          `**1. Posicionamento Atual:** Identificamos foco em serviços/produtos de ${f.name}, com oportunidades de clarificação da proposta de valor central.`,
          `**2. Fricções & Gargalos:** Volume de produção dependente de aprovação manual (${f.contents?.approval.length ?? 0} conteúdo(s) aguardando validação); tarefas pendentes acumuladas (${f.tasks?.pending ?? 0}).`,
          `**3. Pontos Fortes:** Histórico de entregas consistente e base de ativos em construção.`,
          `**4. Ações Corretivas Imediatas:**\n${list(nextSteps(f))}`,
        ].join('\n\n'),
      }
    case 'strategic_plan':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Plano Estratégico 30/60/90 Dias — ${f.name}`,
          `**1. Metas & KPIs Principais:** Aumentar consistência de publicações para 3-4x por semana e reduzir tempo de resposta do funil comercial.`,
          `**2. Pilares de Conteúdo Recomendados:**`,
          `- **Pilar Atração (40%):** Reels curtos e carrosséis práticos abordando dores imediatas do público.`,
          `- **Pilar Conexão / Bastidores (30%):** Rotina real, metodologia de trabalho e provas sociais.`,
          `- **Pilar Conversão (30%):** Estudos de caso, chamadas diretas para WhatsApp e esclarecimento de objeções.`,
          `**3. Próximos Passos:** Validar pautas com o cliente e iniciar roteirização das primeiras semanas.`,
        ].join('\n\n'),
      }
    case 'editorial_calendar':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Calendário Editorial Sugerido — ${f.name}`,
          `| Dia | Formato | Pilar | Tema & Gancho | CTA |`,
          `| --- | --- | --- | --- | --- |`,
          `| Terça | Reel (30s) | Atração | "O maior erro que você comete ao..." | Salve para consultar depois |`,
          `| Quinta | Carrossel (6 telas) | Autoridade | "Passo a passo comprovado para..." | Comente 'QUERO' para detalhes |`,
          `| Sábado | Story interativo | Conexão | Enquete sobre a maior dificuldade atual | Envie mensagem no Direct |`,
          `| Terça seguinte | Reel | Conversão | "Como resolvemos o problema do cliente X" | Toque no link da bio |`,
        ].join('\n\n'),
      }
    case 'campaign_ideas':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Ideias de Campanha — ${f.name}`,
          `**Campanha 1: "Desafio Semanal"**`,
          `- **Objetivo:** Engajamento e geração de leads orgânicos.`,
          `- **Gancho:** 3 dias de conteúdos práticos resolvendo 1 problema específico do nicho.`,
          `- **Formato:** Carrossel + Reels diários com fechamento para Direct/WhatsApp.`,
          `\n**Campanha 2: "Diagnóstico Express"**`,
          `- **Objetivo:** Conversão de clientes qualificados.`,
          `- **Gancho:** Oferecer 5 avaliações gratuitas de perfil ou processos para novos interessados.`,
          `- **Formato:** Stories em sequência e post estático com CTA de urgência.`,
        ].join('\n'),
      }
    case 'script_writer':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Roteiro para Gravação — ${f.name}`,
          `**[0-3s] Gancho Visual & Verbal:**`,
          `[Pessoa olhando para a câmera com expressão intrigada e apontando para um texto na tela]`,
          `"Se você ainda faz isso desse jeito, está perdendo tempo todos os dias."`,
          `\n**[4-30s] Desenvolvimento & Valor:**`,
          `[Corta para gravação de tela ou demonstração prática rápida]`,
          `"A maioria das pessoas tenta resolver o problema pelo caminho mais longo. O segredo é simplificar em 3 etapas: primeiro organize a base, depois foque na execução e só então escale."`,
          `\n**[30-40s] Conclusão & CTA:**`,
          `[Retorna para a câmera]`,
          `"Quer ver como aplicar isso no seu negócio? Comente 'COMEÇAR' que eu te envio o modelo completo no direct."`,
        ].join('\n'),
      }
    case 'caption_writer':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `Você já reparou como os detalhes fazem toda a diferença nos resultados? 👇`,
          `Muitas vezes o gargalo não está na falta de esforço, mas na ausência de um método claro para organizar as prioridades e executar com consistência.`,
          `Quando você estrutura o processo, o crescimento deixa de ser imprevisível e passa a ser rotina.`,
          `💬 Qual é a sua maior dificuldade hoje? Me conta nos comentários!`,
          `\n#gestao #produtividade #marketing #estrategia #${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        ].join('\n\n'),
      }
    case 'commercial_proposal':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Proposta Comercial — Prestação de Serviços para ${f.name}`,
          `**1. Diagnóstico da Oportunidade:** Apoiar a estruturação contínua de projetos, marketing e presença digital com foco em previsibilidade e retorno.`,
          `**2. Escopo dos Serviços:**`,
          `- Gestão e planejamento de calendário editorial estratégico.`,
          `- Produção de roteiros, legendas e direcionamentos visuais.`,
          `- Acompanhamento mensal de indicadores e entregáveis acordados.`,
          `**3. Prazos & Entregas:** Alinhamento quinzenal de pautas e relatórios mensais de evolução.`,
          `**4. Condições Comerciais:** Valores formatados em ciclos mensais sob contrato de prestação de serviços.`,
        ].join('\n\n'),
      }
    case 'briefing_generator':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Guia de Briefing para ${f.name}`,
          `**1. Sobre o Negócio:** Qual é o produto/serviço carro-chefe? Qual é a margem e ticket médio?`,
          `**2. Público e Persona:** Quem é o cliente ideal (ICP)? Quais as maiores objeções na hora da compra?`,
          `**3. Concorrência:** Quais 3 concorrentes você admira e quais 3 você não quer parecer?`,
          `**4. Tom de Voz:** Quais palavras definem a marca (ex.: séria, descontraída, técnica, acolhedora)?`,
          `**5. Metas:** Qual é a principal métrica de sucesso para os próximos 3 meses?`,
        ].join('\n\n'),
      }
    case 'improvement_suggestions':
      return {
        source: 'demo',
        notice: NOTICE,
        text: [
          `### Sugestões de Melhoria Prática — ${f.name}`,
          `**A. Vitórias Rápidas (Implementação Imediata):**`,
          `- Atualizar bio e links estratégicos com chamada clara para ação.`,
          `- Destacar os 3 principais depoimentos ou cases nos destaques fixados.`,
          `\n**B. Otimizações Estruturais:**`,
          `- Padronizar o processo de aprovação para evitar retenção de publicações.`,
          `- Criar templates reutilizáveis para agilizar a criação de carrosséis e reels.`,
          `\n**C. Testes para o Próximo Mês:**`,
          `- Testar 2 formatos com ganchos em formato de pergunta contra ganchos de afirmação forte.`,
        ].join('\n'),
      }
    default:
      return {
        source: 'demo',
        notice: NOTICE,
        text: `Estou em modo demonstração, então não interpreto perguntas livres. Com base nos dados de **${f.name}**:\n\n${list([...taskLines(f), ...financeLines(f)])}\n\n**Sugestões:**\n${list(nextSteps(f))}`,
      }
  }
}

export const demoProvider: AIProvider = {
  id: 'demo',
  async run(_req, original) {
    await new Promise((r) => setTimeout(r, 350)) // simula latência curta
    return answer(original)
  },
}
