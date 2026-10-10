import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthContext, type AuthContextValue } from './authContext'

/** Mensagens genéricas: não revelam se um e-mail existe ou não. */
function authMessage(error: AuthError): string {
  if (error.status === 429 || error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit')
    return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
  if (error.code === 'invalid_credentials') return 'E-mail ou senha incorretos.'
  if (error.code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.'
  if (error.code === 'weak_password') return 'Senha fraca. Use uma senha mais longa e variada.'
  if (error.code === 'same_password') return 'A nova senha precisa ser diferente da atual.'
  if (/fetch|network/i.test(error.message)) return 'Sem conexão com o servidor.'
  return 'Não foi possível concluir. Tente novamente.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') {
        setRecovering(true)
        navigate('/redefinir-senha', { replace: true })
      }
      if (event === 'SIGNED_OUT') {
        setRecovering(false)
        navigate('/entrar', { replace: true })
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      recovering,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
        return error ? authMessage(error) : null
      },
      async signOut() {
        await supabase.auth.signOut()
      },
      async sendPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        })
        // Só erros de limite são mostrados; o resto vira a mesma mensagem neutra.
        if (error && (error.status === 429 || error.code?.includes('rate_limit'))) return authMessage(error)
        return null
      },
      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) return authMessage(error)
        setRecovering(false)
        return null
      },
    }),
    [loading, session, recovering],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
