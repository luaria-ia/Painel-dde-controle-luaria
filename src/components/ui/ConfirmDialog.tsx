import { useCallback, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import { ConfirmContext, type ConfirmFn, type ConfirmOptions } from './confirmContext'
import { Modal } from './Modal'


/** Fornece `confirm()` baseado em Promise, usado antes de exclusões. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<(value: boolean) => void>(undefined)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (value: boolean) => {
    resolver.current?.(value)
    resolver.current = undefined
    setOptions(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!options}
        onClose={() => close(false)}
        size="sm"
        title={
          <span className="flex items-center gap-2">
            {options?.danger !== false && <AlertTriangle className="h-4 w-4 text-rose-500" />}
            {options?.title}
          </span>
        }
        footer={
          <>
            <Button onClick={() => close(false)}>Cancelar</Button>
            <Button variant={options?.danger === false ? 'primary' : 'danger'} onClick={() => close(true)} data-autofocus>
              {options?.confirmLabel ?? 'Excluir'}
            </Button>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-muted">{options?.message ?? 'Esta ação não pode ser desfeita.'}</div>
      </Modal>
    </ConfirmContext.Provider>
  )
}
