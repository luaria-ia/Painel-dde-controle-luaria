import { Clock, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/confirmContext'
import { useToast } from '@/components/ui/toastContext'
import { findTrack } from '@/data/studies'
import { addDays, formatDate, todayISO } from '@/lib/format'
import { formatMinutes } from '@/lib/studies'
import { useStudies } from '@/store/studiesContext'
import type { StudyHourLog } from '@/types/studies'

/** Barras dos últimos N dias (minutos por dia). */
export function HoursChart({ hours, days = 14 }: { hours: StudyHourLog[]; days?: number }) {
  const today = todayISO()
  const list = Array.from({ length: days }, (_, i) => addDays(today, i - days + 1))
  const per = list.map((d) => hours.filter((h) => h.date === d).reduce((n, h) => n + h.minutes, 0))
  const max = Math.max(60, ...per)
  return (
    <div className="flex h-[150px] items-end gap-1.5 pt-2" role="img" aria-label={`Horas estudadas nos últimos ${days} dias`}>
      {list.map((d, i) => (
        <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${formatDate(d)} — ${per[i] ? formatMinutes(per[i]) : 'sem registro'}`}>
          <div
            className={per[i] ? 'w-full max-w-7 rounded-t-[4px] rounded-b-[2px] bg-accent/90' : 'h-0.5 w-full max-w-7 rounded bg-line'}
            style={per[i] ? { height: `${Math.max(3, (per[i] / max) * 120)}px` } : undefined}
          />
          <span className="tabular text-[10.5px] text-subtle">{d.slice(8)}</span>
        </div>
      ))}
    </div>
  )
}

export function HoursList({ hours, limit = 6, showTrack = true }: { hours: StudyHourLog[]; limit?: number; showTrack?: boolean }) {
  const { deleteHours } = useStudies()
  const confirm = useConfirm()
  const toast = useToast()
  if (!hours.length) return <EmptyState compact icon={Clock} title="Nenhuma hora registrada ainda" />
  return (
    <ul className="divide-y divide-line">
      {hours.slice(0, limit).map((h) => (
        <li key={h.id} className="flex items-start gap-3 px-4 py-2.5 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="tabular text-[13.5px] font-medium">
              {formatDate(h.date)} · {formatMinutes(h.minutes)}
              {showTrack && <span className="font-normal text-subtle"> · {findTrack(h.trackId)?.title ?? h.trackId}</span>}
            </p>
            {h.note && <p className="mt-0.5 text-[13px] text-muted">{h.note}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            icon={Trash2}
            aria-label="Excluir registro"
            title="Excluir registro"
            onClick={async () => {
              if (
                !(await confirm({
                  title: 'Excluir registro de horas?',
                  message: `${formatDate(h.date)} · ${formatMinutes(h.minutes)}`,
                  danger: true,
                }))
              )
                return
              if (await deleteHours(h.id)) toast.success('Registro excluído')
            }}
          />
        </li>
      ))}
    </ul>
  )
}
