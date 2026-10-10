import { addDays, toISODate, todayISO } from '@/lib/format'
import type { CalendarEvent, Client, Content, Contract, FileItem, KnowledgeItem, Project, Task, Transaction } from '@/types'

/**
 * Dados iniciais.
 *
 * - Os 3 projetos são reais do usuário (isDemo: false) e permanecem ao limpar exemplos.
 * - Tarefas, clientes e lançamentos são fictícios (isDemo: true) e podem ser
 *   removidos de uma vez em Configurações → "Remover dados de exemplo".
 * - As datas são relativas a hoje para o sistema parecer "vivo" ao abrir.
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
 * @param existingProjects projetos já existentes na conta. Os 3 projetos iniciais
 * com o mesmo nome são reaproveitados (não duplicados) — usado por "Carregar exemplos".
 */
export function buildSeed(existingProjects: Project[] = []): SeedData {
  const today = todayISO()
  const d = (offset: number) => addDays(today, offset)
  const ts = (offset: number) => new Date(`${d(offset)}T12:00:00`).toISOString()
  /** Dia `day` do mês de `monthsAgo` meses atrás (no mês atual, nunca depois de hoje). */
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
    luaria: existingId('Luaria') ?? uuid(),
    med: existingId('Med Resumos') ?? uuid(),
    social: existingId('Social Media') ?? uuid(),
  }
  const C = { clinica: uuid(), studio: uuid(), cafe: uuid(), escola: uuid() }

  const allProjects: Project[] = [
    {
      id: P.luaria,
      name: 'Luaria',
      description: 'Projeto Luaria — edite esta descrição com o objetivo e a proposta do projeto.',
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
    {
      id: P.med,
      name: 'Med Resumos',
      description: 'Venda de resumos e bancos de questões para estudantes de Medicina.',
      status: 'ativo',
      color: 'teal',
      type: 'outro',
      clientId: null,
      owners: [],
      startDate: null,
      dueDate: null,
      boardsProvisionedAt: null,
      createdAt: ts(-110),
      updatedAt: ts(-110),
      isDemo: false,
    },
    {
      id: P.social,
      name: 'Social Media',
      description: 'Gestão de redes sociais para clientes: planejamento, criação e publicação de conteúdo.',
      status: 'ativo',
      color: 'amber',
      type: 'outro',
      clientId: null,
      owners: [],
      startDate: null,
      dueDate: null,
      boardsProvisionedAt: null,
      createdAt: ts(-100),
      updatedAt: ts(-100),
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
      phone: '(00) 0000-0000',
      whatsapp: '(00) 90000-0000',
      company: 'Clínica Aurora (fictícia)',
      notes: 'Cliente de demonstração. Pacote mensal: 12 posts + 4 reels.',
      status: 'ativo',
      projectIds: [P.social],
      ...demoBase(-80),
    },
    {
      id: C.studio,
      name: 'Studio Exemplo Lumen',
      email: 'ola@exemplo-lumen.com',
      phone: '',
      whatsapp: '(00) 90000-0001',
      company: 'Studio Lumen (fictício)',
      notes: 'Cliente de demonstração. Interessado em pacote trimestral.',
      status: 'negociacao',
      projectIds: [P.social, P.luaria],
      ...demoBase(-30),
    },
    {
      id: C.cafe,
      name: 'Café Exemplo Bonfim',
      email: 'cafe@exemplo-bonfim.com',
      phone: '(00) 0000-0001',
      whatsapp: '',
      company: 'Café Bonfim (fictício)',
      notes: 'Cliente de demonstração. Contrato pausado em agosto.',
      status: 'inativo',
      projectIds: [P.social],
      ...demoBase(-150),
    },
    {
      id: C.escola,
      name: 'Turma Exemplo — 3º ano',
      email: 'turma@exemplo.com',
      phone: '',
      whatsapp: '(00) 90000-0002',
      company: 'Grupo de estudantes (fictício)',
      notes: 'Cliente de demonstração. Compra coletiva de resumos.',
      status: 'ativo',
      projectIds: [P.med],
      ...demoBase(-60),
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
    task({ title: 'Criar Reel de apresentação', projectId: P.social, clientId: C.clinica, status: 'em_andamento', priority: 'alta', dueDate: d(1), description: 'Roteiro + gravação + edição. Duração até 30s.' }, -6),
    task({ title: 'Criar carrossel "5 mitos sobre skincare"', projectId: P.social, clientId: C.clinica, status: 'a_fazer', priority: 'media', dueDate: d(3) }, -5),
    task({ title: 'Enviar proposta comercial', projectId: P.social, clientId: C.studio, status: 'a_fazer', priority: 'urgente', dueDate: d(-1), description: 'Proposta trimestral com 3 opções de pacote.' }, -8),
    task({ title: 'Calendário editorial de novembro', projectId: P.social, status: 'a_fazer', priority: 'media', dueDate: d(9) }, -2),
    task({ title: 'Revisar resumo de Fisiologia', projectId: P.med, status: 'em_andamento', priority: 'alta', dueDate: d(2) }, -4),
    task({ title: 'Montar banco de 40 questões de Micro', projectId: P.med, status: 'a_fazer', priority: 'media', dueDate: d(12) }, -3),
    task({ title: 'Entregar pacote da turma', projectId: P.med, clientId: C.escola, status: 'concluido', priority: 'alta', dueDate: d(-5) }, -12),
    task({ title: 'Definir identidade visual', projectId: P.luaria, status: 'em_andamento', priority: 'media', dueDate: d(6) }, -9),
    task({ title: 'Pesquisar concorrentes', projectId: P.luaria, status: 'concluido', priority: 'baixa', dueDate: d(-10) }, -20),
    task({ title: 'Escrever página "Sobre"', projectId: P.luaria, status: 'a_fazer', priority: 'baixa', dueDate: d(-2) }, -7),
  ]

  const trx = (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'clientId'> & { clientId?: string | null }, _order: number): Transaction => ({
    id: uuid(),
    clientId: null,
    ...demoBase(-1),
    ...t,
  })

  // Lançamentos espalhados nos últimos meses para alimentar o gráfico.
  const transactions: Transaction[] = [
    trx({ type: 'receita', description: 'Mensalidade social media — Aurora', amountCents: 60000, date: m(0, 5), category: 'Mensalidade', projectId: P.social, clientId: C.clinica, status: 'recebido' }, 1),
    trx({ type: 'receita', description: 'Mensalidade social media — Aurora', amountCents: 60000, date: m(1, 5), category: 'Mensalidade', projectId: P.social, clientId: C.clinica, status: 'recebido' }, 2),
    trx({ type: 'receita', description: 'Mensalidade social media — Aurora', amountCents: 60000, date: m(2, 5), category: 'Mensalidade', projectId: P.social, clientId: C.clinica, status: 'recebido' }, 3),
    trx({ type: 'receita', description: 'Venda de resumos — lote do mês', amountCents: 145000, date: m(0, 10), category: 'Produto digital', projectId: P.med, status: 'recebido' }, 4),
    trx({ type: 'receita', description: 'Venda de resumos — lote do mês', amountCents: 98000, date: m(1, 12), category: 'Produto digital', projectId: P.med, status: 'recebido' }, 5),
    trx({ type: 'receita', description: 'Venda de resumos — lote do mês', amountCents: 121000, date: m(2, 12), category: 'Produto digital', projectId: P.med, status: 'recebido' }, 6),
    trx({ type: 'receita', description: 'Venda de resumos — lote do mês', amountCents: 76000, date: m(3, 12), category: 'Produto digital', projectId: P.med, status: 'recebido' }, 7),
    trx({ type: 'receita', description: 'Pacote coletivo — turma', amountCents: 40000, date: d(5), category: 'Venda', projectId: P.med, clientId: C.escola, status: 'pendente' }, 8),
    trx({ type: 'receita', description: 'Setup de perfil — Lumen', amountCents: 35000, date: d(-3), category: 'Serviço', projectId: P.social, clientId: C.studio, status: 'atrasado' }, 9),
    trx({ type: 'receita', description: 'Última mensalidade — Bonfim', amountCents: 45000, date: m(4, 5), category: 'Mensalidade', projectId: P.social, clientId: C.cafe, status: 'recebido' }, 10),
    trx({ type: 'despesa', description: 'Assinatura ferramenta de design', amountCents: 5500, date: m(0, 3), category: 'Ferramentas', projectId: P.social, status: 'pago' }, 11),
    trx({ type: 'despesa', description: 'Assinatura ferramenta de design', amountCents: 5500, date: m(1, 3), category: 'Ferramentas', projectId: P.social, status: 'pago' }, 12),
    trx({ type: 'despesa', description: 'Anúncios — campanha de resumos', amountCents: 25000, date: m(0, 8), category: 'Anúncios', projectId: P.med, status: 'pago' }, 13),
    trx({ type: 'despesa', description: 'Anúncios — campanha de resumos', amountCents: 18000, date: m(1, 8), category: 'Anúncios', projectId: P.med, status: 'pago' }, 14),
    trx({ type: 'despesa', description: 'Hospedagem e domínio', amountCents: 9000, date: m(2, 20), category: 'Ferramentas', projectId: P.luaria, status: 'pago' }, 15),
    trx({ type: 'despesa', description: 'Impostos (DAS)', amountCents: 7600, date: d(8), category: 'Impostos', projectId: null, status: 'a_pagar' }, 16),
    trx({ type: 'despesa', description: 'Freelancer — edição de vídeo', amountCents: 15000, date: d(4), category: 'Freelancer', projectId: P.social, status: 'a_pagar' }, 17),
  ]

  // ---------- V2: eventos, contratos, conteúdos, arquivos ----------
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
    ev({ title: 'Reunião de alinhamento — Aurora', type: 'reuniao', date: d(0), startTime: '14:00', endTime: '15:00', projectId: P.social, clientId: C.clinica, description: 'Revisar calendário de novembro e aprovar roteiros.' }),
    ev({ title: 'Apresentação de proposta — Lumen', type: 'reuniao', date: d(2), startTime: '10:00', endTime: '11:00', projectId: P.social, clientId: C.studio }),
    ev({ title: 'Live de revisão para a turma', type: 'evento', date: d(5), startTime: '19:30', endTime: '21:00', projectId: P.med, clientId: C.escola }),
    ev({ title: 'Prazo para enviar o DAS', type: 'compromisso', date: d(8), startTime: null, projectId: null }),
    ev({ title: 'Sessão de fotos da marca', type: 'compromisso', date: d(10), startTime: '09:00', projectId: P.luaria }),
    ev({ title: 'Call de onboarding — Aurora', type: 'reuniao', date: d(-9), startTime: '16:00', projectId: P.social, clientId: C.clinica, status: 'concluido' }),
  ]

  const ct = (c: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'notes'> & Partial<Pick<Contract, 'notes'>>): Contract => ({
    id: uuid(),
    notes: '',
    ...base,
    ...c,
  })
  const contracts: Contract[] = [
    ct({ title: 'Gestão de Redes Sociais — Aurora', clientId: C.clinica, projectId: P.social, service: '12 posts + 4 reels por mês', amountCents: 60000, periodicity: 'mensal', startDate: m(3, 1), endDate: addDays(m(3, 1), 365), nextRenewal: addDays(today, 12), status: 'ativo', notes: 'Reajuste anual pelo IPCA.' }),
    ct({ title: 'Pacote trimestral — Lumen', clientId: C.studio, projectId: P.social, service: 'Setup de perfil + 3 meses de gestão', amountCents: 150000, periodicity: 'trimestral', startDate: d(7), endDate: d(97), nextRenewal: null, status: 'pendente', notes: 'Aguardando assinatura.' }),
    ct({ title: 'Social media — Bonfim', clientId: C.cafe, projectId: P.social, service: 'Gestão de Instagram', amountCents: 45000, periodicity: 'mensal', startDate: m(10, 1), endDate: m(4, 1), nextRenewal: null, status: 'encerrado' }),
    ct({ title: 'Pacote coletivo de resumos — turma', clientId: C.escola, projectId: P.med, service: 'Resumos do semestre (acesso coletivo)', amountCents: 40000, periodicity: 'unico', startDate: m(1, 15), endDate: d(-3), nextRenewal: null, status: 'ativo' }),
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
    cn({ title: '5 mitos sobre skincare', type: 'carrossel', status: 'aprovacao', projectId: P.social, clientId: C.clinica, plannedDate: d(3), publishDate: d(4), caption: 'Você ainda acredita nisso? Arraste para o lado 👉', cta: 'Agende sua avaliação pelo link da bio' }),
    cn({ title: 'Bastidores do atendimento', type: 'reel', status: 'producao', projectId: P.social, clientId: C.clinica, plannedDate: d(6) }),
    cn({ title: 'Depoimento de paciente', type: 'reel', status: 'agendado', projectId: P.social, clientId: C.clinica, publishDate: d(1), caption: 'Resultados reais, cuidado de verdade.' }),
    cn({ title: 'Antes e depois (com autorização)', type: 'post', status: 'ideia', projectId: P.social, clientId: C.clinica }),
    cn({ title: 'Lançamento do perfil Lumen', type: 'post', status: 'roteiro', projectId: P.social, clientId: C.studio, plannedDate: d(9) }),
    cn({ title: 'Dica de estudo: revisão espaçada', type: 'carrossel', status: 'publicado', projectId: P.med, publishDate: d(-6), caption: 'Salve para revisar depois 📌', cta: 'Conheça os resumos no link da bio' }),
    cn({ title: 'Mapa mental de Fisiologia', type: 'story', status: 'agendado', projectId: P.med, publishDate: d(2) }),
    cn({ title: 'Manifesto da marca', type: 'video', status: 'ideia', projectId: P.luaria }),
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
  // Exemplos sem arquivo anexado (apenas registro). Envie arquivos reais pela página Arquivos.
  const files: FileItem[] = [
    fl({ name: 'Briefing — Clínica Aurora', category: 'briefing', mimeType: 'application/pdf', projectId: P.social, clientId: C.clinica, description: 'Público, tom de voz e objetivos.' }),
    fl({ name: 'Contrato assinado — Aurora', category: 'documento', mimeType: 'application/pdf', projectId: P.social, clientId: C.clinica }),
    fl({ name: 'Planilha de vendas — resumos', category: 'planilha', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', projectId: P.med }),
    fl({ name: 'Moodboard da marca', category: 'imagem', mimeType: 'image/png', projectId: P.luaria }),
  ]

  // ---------- V3: base de conhecimento (exemplos) ----------
  const kn = (k: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'isDemo' | 'clientId' | 'tags'> & Partial<Pick<KnowledgeItem, 'clientId' | 'tags'>>): KnowledgeItem => ({
    id: uuid(),
    clientId: null,
    tags: [],
    ...base,
    ...k,
  })
  const knowledge: KnowledgeItem[] = [
    kn({
      title: 'Posicionamento do serviço de Social Media',
      category: 'estrategia',
      projectId: P.social,
      content:
        'Atendo pequenos negócios locais (clínicas, cafés, estúdios) com pacotes mensais de conteúdo. Diferencial: planejamento mensal aprovado com antecedência e relatórios simples de resultado. Tom: próximo, claro e profissional.',
      tags: ['posicionamento', 'pacotes'],
    }),
    kn({
      title: 'Processo de aprovação de conteúdo',
      category: 'processo',
      projectId: P.social,
      content: '1) Roteiro enviado até dia 20. 2) Cliente aprova em até 3 dias úteis. 3) Produção na semana seguinte. 4) Agendamento com 48h de antecedência.',
      tags: ['aprovação'],
    }),
    kn({
      title: 'Tom de voz — Clínica Aurora',
      category: 'publico',
      projectId: P.social,
      clientId: C.clinica,
      content: 'Público feminino 25–45 anos interessado em skincare e autocuidado. Linguagem acolhedora, sem promessas milagrosas, sempre com base em evidências. Evitar termos técnicos sem explicação.',
      tags: ['tom de voz', 'skincare'],
    }),
    kn({
      title: 'Público do Med Resumos',
      category: 'publico',
      projectId: P.med,
      content: 'Estudantes de Medicina do ciclo básico e clínico. Dores: pouco tempo, muito conteúdo, provas próximas. Valorizam resumos objetivos, mapas mentais e bancos de questões comentadas.',
      tags: ['estudantes'],
    }),
    kn({
      title: 'Sobre a Luaria (preencher)',
      category: 'contexto',
      projectId: P.luaria,
      content: 'Exemplo: descreva aqui o que é a Luaria, para quem é, quais produtos/serviços oferece e como quer ser percebida. A IA usa este texto como contexto do projeto.',
    }),
  ]

  return { projects, tasks, clients, transactions, events, contracts, contents, files, knowledge }
}
