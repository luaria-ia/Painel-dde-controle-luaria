import { addDays, todayISO } from '@/lib/format'
import { contentDate } from '@/lib/selectors'
import type { Content, ContentStatus } from '@/types'

/** Conteúdos "em produção" = já saíram da ideia e ainda não foram para aprovação. */
export const IN_PRODUCTION: ContentStatus[] = ['roteiro', 'producao']

export function contentStats(contents: Content[], today = todayISO()) {
  const by = (s: ContentStatus) => contents.filter((c) => c.status === s).length
  const month = today.slice(0, 7)
  return {
    total: contents.length,
    ideas: by('ideia'),
    production: contents.filter((c) => IN_PRODUCTION.includes(c.status)).length,
    approval: by('aprovacao'),
    scheduled: by('agendado'),
    published: by('publicado'),
    publishedMonth: contents.filter((c) => c.status === 'publicado' && (contentDate(c) ?? '').startsWith(month)).length,
    late: contents.filter((c) => c.status !== 'publicado' && (contentDate(c) ?? '9999') < today).length,
    /** Próximos 14 dias, ainda não publicados, por data. */
    upcoming: contents
      .filter((c) => c.status !== 'publicado' && contentDate(c) && contentDate(c)! >= today && contentDate(c)! <= addDays(today, 14))
      .sort((a, b) => contentDate(a)!.localeCompare(contentDate(b)!)),
  }
}
