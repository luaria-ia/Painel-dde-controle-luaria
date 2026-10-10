import { CURRENCY, LOCALE } from '@/config/app'
import type { ISODate } from '@/types'

const currencyFmt = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })

export function formatCurrency(cents: number): string {
  return currencyFmt.format(cents / 100)
}

/** Converte texto digitado ("1.234,56", "1234.5", "R$ 20") em centavos. Retorna null se inválido. */
export function parseCurrencyToCents(input: string): number | null {
  const cleaned = input.replace(/[^\d,.-]/g, '').trim()
  if (!cleaned) return null
  let normalized = cleaned
  if (cleaned.includes(',')) {
    // formato brasileiro: ponto = milhar, vírgula = decimal
    normalized = cleaned.replace(/\./g, '').replace(',', '.')
  }
  const value = Number(normalized)
  if (!Number.isFinite(value)) return null
  return Math.round(value * 100)
}

/** Centavos → texto editável "1234,56". */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

// ---------- Datas ----------

/** Data local de hoje em 'YYYY-MM-DD' (sem bug de fuso). */
export function todayISO(): ISODate {
  return toISODate(new Date())
}

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** 'YYYY-MM-DD' → Date local à meia-noite. */
export function parseISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function formatDate(iso: ISODate | null | undefined): string {
  if (!iso) return '—'
  return parseISODate(iso).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateShort(iso: ISODate | null | undefined): string {
  if (!iso) return '—'
  return parseISODate(iso).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Diferença em dias (positivo = futuro). */
export function daysFromToday(iso: ISODate): number {
  const ms = parseISODate(iso).getTime() - parseISODate(todayISO()).getTime()
  return Math.round(ms / 86_400_000)
}

/** Texto relativo para prazos: "Hoje", "Amanhã", "Atrasada 3 dias", "em 5 dias". */
export function relativeDue(iso: ISODate): string {
  const diff = daysFromToday(iso)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff === -1) return 'Ontem'
  if (diff < 0) return `${Math.abs(diff)} dias atrás`
  if (diff <= 7) return `em ${diff} dias`
  return formatDateShort(iso)
}

export function monthKey(iso: ISODate): string {
  return iso.slice(0, 7) // 'YYYY-MM'
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const label = new Date(y, m - 1, 1).toLocaleDateString(LOCALE, { month: 'short' })
  return label.replace('.', '')
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
