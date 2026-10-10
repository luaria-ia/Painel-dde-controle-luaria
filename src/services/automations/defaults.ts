import type { Automation, CreateInput } from '@/types'

/**
 * Regras padrão criadas para toda conta (o usuário pode desligar/editar).
 * Cobrem os exemplos da especificação: alertas de atraso, vencimento, aprovação,
 * receita registrada e data de publicação automática.
 */
export const DEFAULT_AUTOMATIONS: Array<CreateInput<Automation>> = [
  {
    name: 'Alertar tarefas atrasadas',
    enabled: true,
    trigger: 'task_overdue',
    conditions: {},
    action: { type: 'notify', severity: 'danger', message: 'Tarefa atrasada: {titulo}' },
    isSystem: true,
    lastRunAt: null,
  },
  {
    name: 'Alertar contratos vencendo em 7 dias',
    enabled: true,
    trigger: 'contract_due',
    conditions: { days: 7 },
    action: { type: 'notify', severity: 'warning', message: 'Contrato vence em {dias} dias: {titulo}' },
    isSystem: true,
    lastRunAt: null,
  },
  {
    name: 'Alertar conteúdos aguardando aprovação',
    enabled: true,
    trigger: 'content_approval',
    conditions: {},
    action: { type: 'notify', severity: 'warning', message: 'Conteúdo aguardando aprovação: {titulo}' },
    isSystem: true,
    lastRunAt: null,
  },
  {
    name: 'Registrar data ao publicar conteúdo',
    enabled: true,
    trigger: 'content_published',
    conditions: {},
    action: { type: 'set_publish_date' },
    isSystem: true,
    lastRunAt: null,
  },
  {
    name: 'Avisar receita registrada',
    enabled: true,
    trigger: 'income_created',
    conditions: {},
    action: { type: 'notify', severity: 'success', message: 'Receita registrada: {titulo} · {valor}' },
    isSystem: true,
    lastRunAt: null,
  },
]
