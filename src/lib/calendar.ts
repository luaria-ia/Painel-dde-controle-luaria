import { LOCALE } from '@/config/app'
import type { ISODate } from '@/types'
import { addDays, parseISODate, toISODate } from './format'

/** Utilitários de datas do calendário (semana começa no domingo). */
export type CalendarMode = 'mes' | 'semana' | 'dia'

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** Domingo da semana que contém a data. */
export function startOfWeek(iso: ISODate): ISODate {
  return addDays(iso, -parseISODate(iso).getDay())
}

/** Intervalo visível para cada modo. */
export function visibleRange(mode: CalendarMode, cursor: ISODate): { from: ISODate; to: ISODate } {
  if (mode === 'dia') return { from: cursor, to: cursor }
  if (mode === 'semana') {
    const from = startOfWeek(cursor)
    return { from, to: addDays(from, 6) }
  }
  const d = parseISODate(cursor)
  const first = toISODate(new Date(d.getFullYear(), d.getMonth(), 1))
  const from = startOfWeek(first)
  return { from, to: addDays(from, 41) } // 6 semanas
}

export function rangeTitle(mode: CalendarMode, cursor: ISODate): string {
  const d = parseISODate(cursor)
  if (mode === 'mes') return d.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
  if (mode === 'dia') return d.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })
  const { from, to } = visibleRange('semana', cursor)
  const f = parseISODate(from)
  const t = parseISODate(to)
  const sameMonth = f.getMonth() === t.getMonth()
  return `${f.getDate()}${sameMonth ? '' : ' ' + f.toLocaleDateString(LOCALE, { month: 'short' })} – ${t.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

