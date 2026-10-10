import { normalize } from '@/lib/utils'
import type { Client } from '@/types'
import type { BoardCard } from '@/types/boards'

const digits = (s: string) => s.replace(/\D/g, '')

/** Possíveis cadastros já existentes para a oportunidade (evita cliente duplicado). */
export function matchClients(card: Pick<BoardCard, 'title' | 'fields'>, clients: Client[]): Client[] {
  const names = [card.title, card.fields.empresa].filter(Boolean).map((n) => normalize(n!))
  const phone = digits(card.fields.whatsapp ?? '')
  return clients.filter(
    (c) =>
      names.some((n) => n.length > 2 && (normalize(c.name) === n || (c.company && normalize(c.company) === n))) ||
      (phone.length >= 8 && [c.whatsapp, c.phone].some((p) => p && digits(p).endsWith(phone.slice(-8)))),
  )
}
