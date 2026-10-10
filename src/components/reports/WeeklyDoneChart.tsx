import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LOCALE } from '@/config/app'
import { addDays, parseISODate, todayISO, toISODate } from '@/lib/format'
import type { Task } from '@/types'

/** Produtividade: tarefas concluídas por semana (últimas 8 semanas, segunda a domingo). */
export function WeeklyDoneChart({ tasks }: { tasks: Task[] }) {
  const today = parseISODate(todayISO())
  const monday = addDays(todayISO(), -((today.getDay() + 6) % 7))
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const from = addDays(monday, -7 * (7 - i))
    const to = addDays(from, 6)
    const done = tasks.filter((t) => {
      if (!t.completedAt) return false
      const d = toISODate(new Date(t.completedAt))
      return d >= from && d <= to
    }).length
    return { label: parseISODate(from).toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' }), done }
  })
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeks} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--subtle)', fontSize: 11 }} />
          <YAxis width={28} allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'var(--subtle)', fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 12, color: 'var(--fg)' }}
            formatter={(v) => [v, 'Concluídas']}
            labelFormatter={(l) => `Semana de ${l}`}
          />
          <Bar dataKey="done" fill="#2f9e83" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
