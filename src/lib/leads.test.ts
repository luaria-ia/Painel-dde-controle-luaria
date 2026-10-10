import { describe, expect, it } from 'vitest'
import type { Client } from '@/types'
import { matchClients } from './leads'

const client = (name: string, extra: Partial<Client> = {}): Client => ({ id: name, name, email: '', phone: '', whatsapp: '', company: '', notes: '', status: 'ativo', projectIds: [], createdAt: '', updatedAt: '', ...extra })

describe('conversão lead → cliente sem duplicar', () => {
  const clients = [client('Clínica Vida'), client('Ana Souza', { company: 'Studio Ana', whatsapp: '(41) 99999-1234' }), client('Outro')]
  it('encontra por nome (sem acento/maiúscula), empresa ou WhatsApp', () => {
    expect(matchClients({ title: 'clinica vida', fields: {} }, clients).map((c) => c.id)).toEqual(['Clínica Vida'])
    expect(matchClients({ title: 'Lead X', fields: { empresa: 'Studio Ana' } }, clients).map((c) => c.id)).toEqual(['Ana Souza'])
    expect(matchClients({ title: 'Lead Y', fields: { whatsapp: '+55 41 99999-1234' } }, clients).map((c) => c.id)).toEqual(['Ana Souza'])
  })
  it('não sugere nada quando não há semelhança', () => {
    expect(matchClients({ title: 'Imobiliária XPTO', fields: {} }, clients)).toHaveLength(0)
  })
})
