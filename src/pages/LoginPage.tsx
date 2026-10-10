import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, LockKeyhole, MailCheck } from 'lucide-react'
import { AuthShell } from '@/auth/AuthShell'
import { useAuth } from '@/auth/authContext'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { isValidEmail } from '@/lib/utils'

type Mode = 'login' | 'forgot' | 'sent'

export function LoginPage() {
  const { session, loading, signIn, sendPasswordReset } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email.trim()) || !password) return setError('Informe e-mail e senha.')
    setBusy(true)
    const err = await signIn(email, password)
    setBusy(false)
    if (err) {
      setError(err)
      setPassword('')
      return
    }
    navigate(from.startsWith('/') && !from.startsWith('//') ? from : '/', { replace: true })
  }

  const onForgot = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email.trim())) return setError('Informe um e-mail válido.')
    setBusy(true)
    const err = await sendPasswordReset(email)
    setBusy(false)
    if (err) return setError(err)
    setMode('sent')
  }

  if (mode === 'sent') {
    return (
      <AuthShell title="Verifique seu e-mail">
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck className="h-8 w-8 text-accent" />
          <p className="text-sm text-muted">
            Se <strong className="text-fg">{email.trim()}</strong> estiver cadastrado, você receberá um link para criar uma nova senha.
          </p>
          <Button variant="ghost" icon={ArrowLeft} onClick={() => setMode('login')}>
            Voltar para o login
          </Button>
        </div>
      </AuthShell>
    )
  }

  if (mode === 'forgot') {
    return (
      <AuthShell title="Redefinir senha" description="Enviaremos um link para o seu e-mail.">
        <form className="flex flex-col gap-4" onSubmit={onForgot} noValidate>
          <Field label="E-mail" error={error}>
            {(id) => (
              <Input
                id={id}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                invalid={!!error}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                autoFocus
              />
            )}
          </Field>
          <Button type="submit" variant="primary" loading={busy} className="w-full justify-center">
            Enviar link
          </Button>
          <Button variant="ghost" icon={ArrowLeft} onClick={() => setMode('login')} className="justify-center">
            Voltar
          </Button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Entrar" description="Acesse sua central de projetos.">
      <form className="flex flex-col gap-4" onSubmit={onLogin} noValidate>
        <Field label="E-mail">
          {(id) => (
            <Input
              id={id}
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              autoFocus
            />
          )}
        </Field>
        <Field label="Senha" error={error}>
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="current-password"
              value={password}
              invalid={!!error}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
            />
          )}
        </Field>
        <Button type="submit" variant="primary" icon={LockKeyhole} loading={busy} className="w-full justify-center">
          Entrar
        </Button>
        <button
          type="button"
          onClick={() => {
            setMode('forgot')
            setError(null)
          }}
          className="cursor-pointer text-center text-[13px] text-muted hover:text-fg"
        >
          Esqueci minha senha
        </button>
      </form>
    </AuthShell>
  )
}
