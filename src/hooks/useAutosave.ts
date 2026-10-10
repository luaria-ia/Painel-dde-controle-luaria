import { useCallback, useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

/**
 * Texto com salvamento automático: grava `delay` ms depois da última digitação,
 * e também ao sair da página (desmontar / fechar a aba).
 * Use `key` no componente para reiniciar ao trocar de item.
 */
export function useAutosave(initial: string, save: (value: string) => Promise<boolean>, delay = 800) {
  const [value, setValue] = useState(initial)
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const pending = useRef<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current)
    const v = pending.current
    if (v === null) return
    pending.current = null
    setStatus('saving')
    const ok = await saveRef.current(v)
    if (pending.current !== null) return // digitou de novo enquanto salvava
    setStatus(ok ? 'saved' : 'error')
    if (ok) setSavedAt(new Date())
  }, [])

  const onChange = useCallback(
    (v: string) => {
      setValue(v)
      pending.current = v
      setStatus('pending')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => void flush(), delay)
    },
    [delay, flush],
  )

  useEffect(() => {
    const onHide = () => void flush()
    window.addEventListener('pagehide', onHide)
    return () => {
      window.removeEventListener('pagehide', onHide)
      void flush()
    }
  }, [flush])

  /** `flush` grava imediatamente o que estiver pendente (ex.: ao sair do campo). */
  return { value, onChange, status, savedAt, flush }
}
