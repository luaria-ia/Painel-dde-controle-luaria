import { useState, type FormEvent } from 'react'
import { KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth, validatePassword } from '@/auth/authContext'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'

/** Conta: e-mail logado, troca de senha e saída. */
export function AccountSection() {
  const { user, signOut, updatePassword } = useAuth()
  const toast = useToast()
  const [changing, setChanging] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setChanging(false)
    setPassword('')
    setConfirm('')
    setError(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const weak = validatePassword(password)
    if (weak) return setError(weak)
    if (password !== confirm) return setError('As senhas não conferem.')
    setBusy(true)
    const err = await updatePassword(password)
    setBusy(false)
    if (err) return setError(err)
    toast.success('Senha alterada')
    reset()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 text-sm">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="text-muted">
            Conectado como <strong className="font-medium text-fg">{user?.email}</strong>
          </span>
        </div>
        <div className="flex gap-2">
          {!changing && (
            <Button size="sm" icon={KeyRound} onClick={() => setChanging(true)}>
              Alterar senha
            </Button>
          )}
          <Button size="sm" variant="ghost" icon={LogOut} onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>

      {changing && (
        <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-3 rounded-xl border border-line p-4 sm:grid-cols-2">
          <Field label="Nova senha" hint="Mínimo 10 caracteres, com letras e números.">
            {(id) => <Input id={id} type="password" autoComplete="new-password" value={password} onChange={(e) => (setPassword(e.target.value), setError(null))} autoFocus />}
          </Field>
          <Field label="Confirmar senha" error={error}>
            {(id) => <Input id={id} type="password" autoComplete="new-password" value={confirm} invalid={!!error} onChange={(e) => (setConfirm(e.target.value), setError(null))} />}
          </Field>
          <div className="flex gap-2 sm:col-span-2 sm:justify-end">
            <Button onClick={reset}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={busy}>
              Salvar senha
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
