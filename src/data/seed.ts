import { addDays, toISODate, todayISO } from '@/lib/format'
import type { CalendarEvent, Client, Content, Contract, FileItem, KnowledgeItem, Project, Task, Transaction } from '@/types'

/**
 * Dados iniciais para Luaria.IA Business OS.
 *
 * - Apenas a Luaria.IA como ambiente principal de operação (isDemo: false).
 * - Clientes e tarefas são exemplos voltados a automação com IA (isDemo: true).
 */
export interface SeedData {
  projects: Project[]
  tasks: Task[]
  clients: Client[]
  transactions: Transaction[]
  events: CalendarEvent[]
  contracts: Contract[]
  contents: Content[]
  files: FileItem[]
  knowledge: KnowledgeItem[]
}

/**
 * @param existingProjects projetos já existentes na conta.
 */
export function buildSeed(existingProjects: Project[] = []): SeedData {
  const today = todayISO()
  const d = (offset: number) => addDays(today, offset)
  const ts = (offset: number) => new Date(`${d(offset)}T12:00:00`).toISOString()
  const m = (monthsAgo: number, day: number) => {
    const now = new Date()
    const base = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    const last = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
    const limit = monthsAgo === 0 ? now.getDate() : last
    return toISODate(new Date(base.getFullYear(), base.getMonth(), Math.min(day, limit)))
  }

  const uuid = () => crypto.randomUUID()
  const existingId = (name: string) => existingProjects.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id
  const P = {
    luaria: existingId('Luaria') ?? existingId('Luaria.IA') ?? uuid(),
  }
  const C = { clinica: uuid(), studio: uuid() }

  const allProjects: Project[] = [
    {
      id: P.luaria,
      name: 'Luaria.IA',
      description: 'Central de operações, automação com inteligência artificial e inteligência comercial da Luaria.IA.',
      status: 'ativo',
      color: 'violet',
      type: 'luaria_ai',
      clientId: null,
      owners: [],
      startDate: null,
      dueDate: null,
      boardsProvisionedAt: null,
      createdAt: ts(-120),
      updatedAt: ts(-120),
      isDemo: false,
    },
  ]

  const reused = new Set(existingProjects.map((p) => p.id))
  const projects = allProjects.filter((p) => !reused.has(p.id))

  const demoBase = (offset: number) => ({ createdAt: ts(offset), updatedAt: ts(offset), isDemo: true })

  const clients: Client[] = [
    {
      id: C.clinica,
      name: 'Clínica Exemplo Aurora',
      email: 'contato@exemplo-aurora.com',
      phone: '(11) 4000-1000',
      whatsapp: '(11) 98000-1000',
      company: 'Clínica Aurora (Exemplo)',
      notes: 'Cliente em implantação de Agente de IA para WhatsApp e triagem de consultas.',
      status: 'ativo',
      projectIds: [P.luaria],
      ...demoBase(-60),
    },
    {
      id: C.studio,
      name: 'Studio Exemplo Lumen',
      email: 'ola@exemplo-lumen.com',
      phone: '',
      whatsapp: '(11) 98000-2000',
      company: 'Studio Lumen (Exemplo)',
      notes: 'Interessado em integração de CRM e automação de qualificação comercial.',
      status: 'negociacao',
      projectIds: [P.luaria],
      ...demoBase(-20),
    },
  ]

  const task = (
    t: Pick<Task, 'title' | 'projectId' | 'status' | 'priority'> & Partial<Task>,
    created: number,
  ): Task => ({
    id: uuid(),
    description: '',
    clientId: null,
    dueDate: null,
    completedAt: t.status === 'concluido' ? ts(created + 2) : null,
    ...demoBase(created),
    ...t,
  })

  const tasks: Task[] = [
    task({ title: 'Configurar fluxo de triagem WhatsApp (Clínica Aurora)', projectId: P.luaria, clientId: C.clinica, status: 'em_andamento', priority: 'alta', dueDate: d(2), description: 'Definir regras de negócio e qualificação de convênios.' }, -5),
    task({ title: 'Apresentar proposta de IA comercial (Studio Lumen)', projectId: P.luaria, clientId: C.studio, status: 'a_fazer', priority: 'urgente', dueDate: d(1), description: 'Enviar proposta detalhando escopo e integração de CRM.' }, -3),
    task({ title: 'Mapear novas oportunidades no Radar de Prospecção', projectId: P.luaria, status: 'em_andamento', priority: 'alta', dueDate: d(0), description: 'Analisar e priorizar oportunidades identificadas.' }, -4),
    task({ title: 'Homologar webhooks de automação', projectId: P.luaria, status: 'a_fazer', priority: 'media', dueDate: d(5) }, -2),
    task({ title: 'Publicar release inicial do Business OS Luaria.IA', projectId: P.luaria, status: 'concluido', priority: 'alta', dueDate: d(-1) }, -10),
  ]

  const trx = (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'clientId'> & { clientId?: string | null }, _order: number): Transaction => ({
    id: uuid(),
    clientId: null,
    ...demoBase(-1),
    ...t,
  })

  const transactions: Transaction[] = [
    trx({ type: 'receita', description: 'Setup Agente WhatsApp — Clínica Aurora', amountCents: 350000, date: m(0, 5), category: 'Serviço', projectId: P.luaria, clientId: C.clinica, status: 'recebido' }, 1),
    trx({ type: 'receita', description: 'Mensalidade Suporte IA — Clínica Aurora', amountCents: 120000, date: m(0, 20), category: 'Mensalidade', projectId: P.luaria, clientId: C.clinica, status: 'recebido' }, 2),
    trx({ type: 'receita', description: 'Setup Automação Comercial — Studio Lumen', amountCents: 280000, date: d(7), category: 'Serviço', projectId: P.luaria, clientId: C.studio, status: 'pendente' }, 3),
    trx({ type: 'despesa', description: 'Hospedagem de Servidores & APIs de IA', amountCents: 19000, date: m(0, 8), category: 'Ferramentas', projectId: P.luaria, status: 'pago' }, 4),
    trx({ type: 'despesa', description: 'Infraestrutura Cloud & Banco de Dados', amountCents: 9500, date: m(0, 15), category: 'Ferramentas', projectId: P.luaria, status: 'pago' }, 5),
  ]

  const base = { ...demoBase(-1) }
  const ev = (e: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'description' | 'status' | 'endTime' | 'clientId'> &
    Partial<Pick<CalendarEvent, 'description' | 'status' | 'endTime' | 'clientId'>>): CalendarEvent => ({
    id: uuid(),
    description: '',
    status: 'agendado',
    endTime: null,
    clientId: null,
    ...base,
    ...e,
  })

  const events: CalendarEvent[] = [
    ev({ title: 'Reunião de Alinhamento Técnico — Aurora', type: 'reuniao', date: d(0), startTime: '14:00', endTime: '15:00', projectId: P.luaria, clientId: C.clinica, description: 'Validação do fluxo conversacional do agente.' }),
    ev({ title: 'Apresentação de Solução de IA — Lumen', type: 'reuniao', date: d(2), startTime: '10:00', endTime: '11:00', projectId: P.luaria, clientId: C.studio }),
  ]

  const ct = (c: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'notes'> & Partial<Pick<Contract, 'notes'>>): Contract => ({
    id: uuid(),
    notes: '',
    ...base,
    ...c,
  })

  const contracts: Contract[] = [
    ct({ title: 'Automação e Agente de Atendimento — Aurora', clientId: C.clinica, projectId: P.luaria, service: 'Implantação de agente de triagem no WhatsApp + suporte mensal', amountCents: 350000, periodicity: 'mensal', startDate: m(1, 1), endDate: addDays(m(1, 1), 365), nextRenewal: addDays(today, 15), status: 'ativo', notes: 'Manutenção e evolução do prompt de atendimento inclusas.' }),
    ct({ title: 'Integração de CRM e Qualificação — Lumen', clientId: C.studio, projectId: P.luaria, service: 'Automação de entrada de leads e qualificação com IA', amountCents: 280000, periodicity: 'unico', startDate: d(5), endDate: d(35), nextRenewal: null, status: 'pendente' }),
  ]

  const cn = (c: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'description' | 'caption' | 'cta' | 'notes' | 'clientId' | 'plannedDate' | 'publishDate'> &
    Partial<Pick<Content, 'description' | 'caption' | 'cta' | 'notes' | 'clientId' | 'plannedDate' | 'publishDate'>>): Content => ({
    id: uuid(),
    description: '',
    caption: '',
    cta: '',
    notes: '',
    clientId: null,
    plannedDate: null,
    publishDate: null,
    ...base,
    ...c,
  })

  const contents: Content[] = [
    cn({ title: 'Como automação com IA reduz 70% do tempo de resposta no WhatsApp', type: 'carrossel', status: 'producao', projectId: P.luaria, plannedDate: d(3), caption: 'Casos práticos de aplicação de IA em negócios.', cta: 'Fale conosco para avaliar sua empresa' }),
    cn({ title: 'Apresentação das soluções Luaria.IA', type: 'video', status: 'ideia', projectId: P.luaria }),
  ]

  const fl = (f: Omit<FileItem, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'description' | 'clientId' | 'sizeBytes' | 'storagePath' | 'url'> &
    Partial<Pick<FileItem, 'description' | 'clientId'>>): FileItem => ({
    id: uuid(),
    description: '',
    clientId: null,
    sizeBytes: null,
    storagePath: null,
    url: null,
    ...base,
    ...f,
  })

  const files: FileItem[] = [
    fl({ name: 'Proposta Comercial Padrão — Luaria.IA', category: 'documento', mimeType: 'application/pdf', projectId: P.luaria, description: 'Template oficial de proposta comercial para automações e IA.' }),
  ]

  const kn = (k: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'clientId' | 'tags'> & Partial<Pick<KnowledgeItem, 'clientId' | 'tags'>>): KnowledgeItem => ({
    id: uuid(),
    clientId: null,
    tags: [],
    ...base,
    ...k,
  })

  const knowledge: KnowledgeItem[] = [
    kn({
      title: 'Posicionamento e Oferta Core — Luaria.IA',
      category: 'estrategia',
      projectId: P.luaria,
      content:
        'A Luaria.IA desenvolve automações empresariais inteligentes e agentes de IA personalizados. Foco em redução de custos operacionais, qualificação de leads 24/7 e integração de sistemas comerciais.',
      tags: ['posicionamento', 'core', 'ia'],
    }),
    kn({
      title: 'Critérios de Avaliação Comercial de Oportunidades',
      category: 'processo',
      projectId: P.luaria,
      content:
        'Priorizar projetos com escopo bem definido em automação, atendimento inteligente e integrações. Descartar projetos genéricos de desenvolvimento de sites comuns sem automação para preservar o foco.',
      tags: ['comercial', 'qualificacao'],
    }),
  ]

  return { projects, tasks, clients, transactions, events, contracts, contents, files, knowledge }
}
