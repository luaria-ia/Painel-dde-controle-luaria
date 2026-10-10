import { useConfirm } from '@/components/ui/confirmContext'
import { useToast } from '@/components/ui/toastContext'

/** Confirmação + exclusão + aviso, padronizado para qualquer entidade. */
export function useRemove() {
  const confirm = useConfirm()
  const toast = useToast()
  return async (opts: { what: string; name: string; action: () => Promise<boolean>; message?: string }): Promise<boolean> => {
    const ok = await confirm({
      title: `Excluir ${opts.what}?`,
      message: opts.message ?? `"${opts.name}" será excluído permanentemente.`,
    })
    if (!ok) return false
    const done = await opts.action()
    if (done) toast.success(`${opts.what.charAt(0).toUpperCase()}${opts.what.slice(1)} excluído`)
    return done
  }
}
