import { supabase } from '@/lib/supabase'
import type { CreateInput, ID, ProspectCompany, UpdateInput } from '@/types'
import type { Repository } from './createSupabaseRepository'
import { fromRow, toRow } from './createSupabaseRepository'

const STORAGE_KEY = 'business_os_market_prospects'

export const DEMO_PROSPECTS: ProspectCompany[] = [
  {
    id: 'demo-prospect-1',
    name: 'Clínica Lumina Estética',
    segment: 'Saúde & Estética',
    location: 'São Paulo - SP',
    website: 'https://luminaestetica.com.br',
    channels: { instagram: '@lumina.estetica', whatsapp: '11988887777' },
    sourcesConsulted: ['Instagram', 'Google Maps'],
    lastVerifiedAt: '2026-10-01',
    opportunities: 'Perfil no Instagram com alta frequência visual mas sem funil de agendamento direto; ausência de automação de primeiro contato.',
    observations: 'Excelente avaliação no Google Maps (4.8), porém o link da bio direcionava para página lenta sem rastreamento.',
    confidenceLevel: 'alto',
    status: 'qualificada',
    nextStep: 'Apresentar diagnóstico de presença e proposta de reestruturação do funil.',
    clientId: null,
    boardCardId: null,
    isDemo: true,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'demo-prospect-2',
    name: 'Boutique Aurora Moda',
    segment: 'Moda & Varejo',
    location: 'Belo Horizonte - MG',
    website: 'https://auroramoda.com.br',
    channels: { instagram: '@auroraboutique' },
    sourcesConsulted: ['Instagram', 'Meta Ads Library'],
    lastVerifiedAt: '2026-10-04',
    opportunities: 'Campanhas ativas no Meta Ads direcionando para página sem catálogo móvel otimizado; oportunidade de Reels estratégicos.',
    observations: 'Fotos de produto de alta qualidade, porém baixo engajamento em comentários e ausência de stories interativos.',
    confidenceLevel: 'medio',
    status: 'em_pesquisa',
    nextStep: 'Mapear 3 concorrentes locais para análise comparativa de formatos.',
    clientId: null,
    boardCardId: null,
    isDemo: true,
    createdAt: '2026-10-04T14:30:00.000Z',
    updatedAt: '2026-10-04T14:30:00.000Z',
  },
  {
    id: 'demo-prospect-3',
    name: 'Instituto Aprender Mais',
    segment: 'Educação & Treinamentos',
    location: 'Campinas - SP',
    website: 'https://aprendermaiscursos.com.br',
    channels: { instagram: '@aprendermais.oficial', linkedin: 'instituto-aprender-mais' },
    sourcesConsulted: ['LinkedIn', 'Google'],
    lastVerifiedAt: '2026-10-07',
    opportunities: 'Página de cursos estática; sem produção de vídeos curtos nem carrosséis educativos para atrair alunos.',
    observations: 'Empresa consolidada há mais de 8 anos mas com presença digital tímida.',
    confidenceLevel: 'baixo',
    status: 'mapeada',
    nextStep: 'Pesquisar responsável pela área de marketing no LinkedIn.',
    clientId: null,
    boardCardId: null,
    isDemo: true,
    createdAt: '2026-10-07T09:15:00.000Z',
    updatedAt: '2026-10-07T09:15:00.000Z',
  },
]

function readLocal(): ProspectCompany[] {
  if (typeof localStorage === 'undefined') return DEMO_PROSPECTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEMO_PROSPECTS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEMO_PROSPECTS
  } catch {
    return DEMO_PROSPECTS
  }
}

function writeLocal(list: ProspectCompany[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* quota or private mode */
  }
}

export const prospectRepository: Repository<ProspectCompany> = {
  async list(): Promise<ProspectCompany[]> {
    try {
      const { data, error } = await supabase
        .from('market_prospects' as any)
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        return data.map((r: any) => fromRow<ProspectCompany>(r))
      }
    } catch {
      /* fallback to local storage */
    }
    return readLocal()
  },

  async create(input: CreateInput<ProspectCompany>): Promise<ProspectCompany> {
    const now = new Date().toISOString()
    const id = crypto.randomUUID()
    const item: ProspectCompany = {
      id,
      ...input,
      channels: input.channels ?? {},
      sourcesConsulted: input.sourcesConsulted ?? [],
      lastVerifiedAt: input.lastVerifiedAt ?? null,
      clientId: input.clientId ?? null,
      boardCardId: input.boardCardId ?? null,
      isDemo: input.isDemo ?? false,
      createdAt: now,
      updatedAt: now,
    }

    try {
      const { data, error } = await supabase
        .from('market_prospects' as any)
        .insert(toRow(item) as any)
        .select()
        .single()
      if (!error && data) {
        return fromRow<ProspectCompany>(data as any)
      }
    } catch {
      /* fallback to local */
    }

    const current = readLocal()
    writeLocal([item, ...current])
    return item
  },

  async update(id: ID, patch: UpdateInput<ProspectCompany>): Promise<ProspectCompany> {
    const now = new Date().toISOString()
    try {
      const { data, error } = await supabase
        .from('market_prospects' as any)
        .update(toRow(patch) as any)
        .eq('id', id)
        .select()
        .single()
      if (!error && data) {
        return fromRow<ProspectCompany>(data as any)
      }
    } catch {
      /* fallback to local */
    }

    const current = readLocal()
    const existing = current.find((p) => p.id === id)
    if (!existing) throw new Error('Empresa prospectada não encontrada.')
    const updated: ProspectCompany = { ...existing, ...patch, updatedAt: now }
    writeLocal(current.map((p) => (p.id === id ? updated : p)))
    return updated
  },

  async remove(id: ID): Promise<void> {
    try {
      await supabase.from('market_prospects' as any).delete().eq('id', id)
    } catch {
      /* fallback */
    }
    const current = readLocal()
    writeLocal(current.filter((p) => p.id !== id))
  },

  async insertMany(items: Array<CreateInput<ProspectCompany> & Partial<Pick<ProspectCompany, 'id' | 'createdAt'>>>): Promise<void> {
    const now = new Date().toISOString()
    const prepared: ProspectCompany[] = items.map((input) => ({
      id: input.id ?? crypto.randomUUID(),
      name: input.name,
      segment: input.segment ?? '',
      location: input.location ?? '',
      website: input.website ?? '',
      channels: input.channels ?? {},
      sourcesConsulted: input.sourcesConsulted ?? [],
      lastVerifiedAt: input.lastVerifiedAt ?? null,
      opportunities: input.opportunities ?? '',
      observations: input.observations ?? '',
      confidenceLevel: input.confidenceLevel ?? 'medio',
      status: input.status ?? 'mapeada',
      nextStep: input.nextStep ?? '',
      clientId: input.clientId ?? null,
      boardCardId: input.boardCardId ?? null,
      isDemo: input.isDemo ?? false,
      createdAt: input.createdAt ?? now,
      updatedAt: now,
    }))

    try {
      await supabase.from('market_prospects' as any).insert(prepared.map((p) => toRow(p)) as any)
    } catch {
      /* fallback */
    }

    const current = readLocal()
    const existingIds = new Set(current.map((p) => p.id))
    writeLocal([...prepared.filter((p) => !existingIds.has(p.id)), ...current])
  },

  async removeDemo(): Promise<number> {
    try {
      await supabase.from('market_prospects' as any).delete().eq('is_demo', true)
    } catch {
      /* fallback */
    }
    const current = readLocal()
    const remaining = current.filter((p) => !p.isDemo)
    const removedCount = current.length - remaining.length
    writeLocal(remaining)
    return removedCount
  },

  async removeAll(): Promise<void> {
    try {
      await supabase.from('market_prospects' as any).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    } catch {
      /* fallback */
    }
    writeLocal([])
  },
}
