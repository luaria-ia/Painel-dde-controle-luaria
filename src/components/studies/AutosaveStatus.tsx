import { AlertCircle, Check } from 'lucide-react'
import type { AutosaveStatus as Status } from '@/hooks/useAutosave'

export function AutosaveStatus({ status, savedAt }: { status: Status; savedAt: Date | null }) {
  if (status === 'idle') return null
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-subtle" role="status" aria-live="polite">
      {status === 'error' ? (
        <>
          <AlertCircle className="h-3 w-3 text-rose-500" /> Não foi possível salvar
        </>
      ) : status === 'saved' && savedAt ? (
        <>
          <Check className="h-3 w-3" /> Salvo às{' '}
          {savedAt.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </>
      ) : (
        'Salvando…'
      )}
    </span>
  )
}
