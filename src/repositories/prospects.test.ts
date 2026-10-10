import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prospectRepository } from './prospects'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: null, error: { message: 'offline' } }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'offline' } }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'offline' } }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: { message: 'offline' } }),
      }),
    }),
  },
}))

const store = new Map<string, string>()
const mockStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, val: string) => store.set(key, val),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
})

describe('prospectRepository', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('lista sementes demo quando o armazenamento local está vazio', async () => {
    const list = await prospectRepository.list()
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list[0]).toHaveProperty('name')
    expect(list[0]).toHaveProperty('confidenceLevel')
    expect(list[0]).toHaveProperty('status')
  })

  it('permite criar uma nova empresa prospectada no radar', async () => {
    const created = await prospectRepository.create({
      name: 'Empresa Teste Inovação',
      segment: 'Tecnologia B2B',
      location: 'Vitória / ES',
      website: 'https://inovacao.teste',
      channels: { whatsapp: '27999998888', linkedin: 'linkedin.com/company/inovacao' },
      sourcesConsulted: ['LinkedIn', 'Google'],
      lastVerifiedAt: '2026-10-09',
      opportunities: 'Demanda por automação de marketing',
      observations: 'Sócio demonstrou interesse em evento',
      confidenceLevel: 'alto',
      status: 'mapeada',
      nextStep: 'Marcar café de apresentação',
      clientId: null,
      boardCardId: null,
    })

    expect(created.id).toBeDefined()
    expect(created.name).toBe('Empresa Teste Inovação')

    const list = await prospectRepository.list()
    const found = list.find((p) => p.id === created.id)
    expect(found).toBeDefined()
    expect(found?.segment).toBe('Tecnologia B2B')
  })

  it('permite atualizar status e dados da prospecção', async () => {
    const created = await prospectRepository.create({
      name: 'Empresa Para Atualizar',
      segment: 'Varejo',
      location: 'São Paulo / SP',
      website: '',
      channels: {},
      sourcesConsulted: ['Instagram'],
      lastVerifiedAt: null,
      opportunities: 'Rede de lojas expandindo',
      observations: '',
      confidenceLevel: 'medio',
      status: 'em_pesquisa',
      nextStep: 'Ligar para diretoria',
      clientId: null,
      boardCardId: null,
    })

    const updated = await prospectRepository.update(created.id, {
      status: 'qualificada',
      confidenceLevel: 'alto',
      nextStep: 'Apresentar proposta na terça',
    })

    expect(updated.status).toBe('qualificada')
    expect(updated.confidenceLevel).toBe('alto')
    expect(updated.nextStep).toBe('Apresentar proposta na terça')
  })

  it('permite remover uma empresa do radar', async () => {
    const created = await prospectRepository.create({
      name: 'Empresa Para Deletar',
      segment: 'Logística',
      location: 'Santos / SP',
      website: '',
      channels: {},
      sourcesConsulted: [],
      lastVerifiedAt: null,
      opportunities: '',
      observations: '',
      confidenceLevel: 'baixo',
      status: 'descartada',
      nextStep: '',
      clientId: null,
      boardCardId: null,
    })

    await prospectRepository.remove(created.id)

    const list = await prospectRepository.list()
    expect(list.some((p) => p.id === created.id)).toBe(false)
  })
})
