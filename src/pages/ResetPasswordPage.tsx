import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthShell } from '@/auth/AuthShell'
import { useAuth, validatePassword } from '@/auth/authContext'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/toastContext'

/** Destino do link "Esqueci minha senha" (o Supabase cria uma sessão temporária de recuperação). */
export function ResetPasswordPage() {
  const { loading, session, updatePassword } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) return <AuthShell title="Verificando link…">{null}</AuthShell>

  if (!session) {
    return (
      <AuthShell title="Link inválido ou expirado" description="Peça um novo link na tela de login.">
        <Button variant="primary" className="w-full justify-center" onClick={() => navigate('/entrar')}>
          Ir para o login
        </Button>
      </AuthShell>
    )
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
    toast.success('Senha atualizada')
    navigate('/', { replace: true })
  }

  return (
    <AuthShell title="Criar nova senha" description="Mínimo de 10 caracteres, com letras e números.">
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Field label="Nova senha">
          {(id) => (
            <Input id={id} type="password" autoComplete="new-password" value={password} onChange={(e) => (setPassword(e.target.value), setError(null))} autoFocus />
          )}
        </Field>
        <Field label="Confirmar senha" error={error}>
          {(id) => (
            <Input id={id} type="password" autoComplete="new-password" value={confirm} invalid={!!error} onChange={(e) => (setConfirm(e.target.value), setError(null))} />
          )}
        </Field>
        <Button type="submit" variant="primary" loading={busy} className="w-full justify-center">
          Salvar nova senha
        </Button>
      </form>
    </AuthShell>
  )
}
