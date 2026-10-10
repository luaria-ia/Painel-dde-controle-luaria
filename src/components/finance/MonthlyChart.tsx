import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, monthLabel } from '@/lib/format'
import { monthlySeries } from '@/lib/selectors'
import type { Transaction } from '@/types'

const INCOME = '#2f9e83'
const EXPENSE = '#e0786b'

type Point = { key: string; receitas: number; despesas: number }

/** Receitas recebidas x despesas pagas por mês (padrão: últimos 6 meses; ou uma série pronta). */
export function MonthlyChart({ transactions, series }: { transactions?: Transaction[]; series?: Point[] }) {
  const base = series ?? monthlySeries(transactions ?? [], 6)
  const multiYear = new Set(base.map((d) => d.key.slice(0, 4))).size > 1
  const data = base.map((d) => ({ ...d, label: multiYear ? `${monthLabel(d.key)}/${d.key.slice(2, 4)}` : monthLabel(d.key) }))
  const empty = data.every((d) => d.receitas === 0 && d.despesas === 0)

  return (
    <div className="relative h-64 w-full">
      <div className="absolute top-0 right-0 z-10 flex items-center gap-4 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: INCOME }} /> Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: EXPENSE }} /> Despesas
        </span>
      </div>
      {empty && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-[13px] text-subtle">
          Registre receitas e despesas para ver a evolução mensal.
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 28, right: 0, left: 0, bottom: 0 }} barGap={4} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--subtle)', fontSize: 12 }} />
          <YAxis
            width={52}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--subtle)', fontSize: 11 }}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k` : String(v))}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-2)' }}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              fontSize: 12,
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--fg)',
            }}
            labelStyle={{ color: 'var(--muted)', marginBottom: 4, textTransform: 'capitalize' }}
            formatter={(value, name) => [formatCurrency(Math.round(Number(value) * 100)), name === 'receitas' ? 'Receitas' : 'Despesas']}
          />
          <Bar dataKey="receitas" fill={INCOME} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="despesas" fill={EXPENSE} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
