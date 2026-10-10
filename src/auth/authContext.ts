import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextValue {
  /** true enquanto a sessão salva ainda está sendo verificada. */
  loading: boolean
  session: Session | null
  user: User | null
  /** true quando o usuário chegou pelo link de redefinição de senha. */
  recovering: boolean
  signIn(email: string, password: string): Promise<string | null>
  signOut(): Promise<void>
  sendPasswordReset(email: string): Promise<string | null>
  updatePassword(password: string): Promise<string | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return ctx
}

/** Requisitos mínimos de senha (o Supabase também valida no servidor). */
export function validatePassword(pw: string): string | null {
  if (pw.length < 10) return 'Use pelo menos 10 caracteres.'
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Misture letras e números.'
  return null
}
