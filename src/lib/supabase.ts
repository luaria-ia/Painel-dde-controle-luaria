import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://hrrvmvtnnobrzyiatkpk.supabase.co'
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || 'sb_publishable_7AaZO5nfvkV6s-HRFUGszA_EmHwSpyl'

if (!url || !key) {
  throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local (veja .env.example).')
}

/**
 * Cliente único do Supabase. A chave publishable é pública por natureza:
 * quem protege os dados é o RLS do banco (cada linha só é visível ao dono).
 */
export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
