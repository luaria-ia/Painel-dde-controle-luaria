/** Converte erros do Supabase/PostgREST/rede em mensagens claras (sem vazar detalhes técnicos). */
export function toAppError(error: unknown): Error {
  const e = (error ?? {}) as { code?: string; message?: string; status?: number }
  const code = e.code ?? ''
  const msg = e.message ?? ''

  let friendly = 'Algo deu errado. Tente novamente.'
  if (code === '23505') friendly = 'Já existe um registro com esse nome.'
  else if (code === '23514' || code === '22001' || code === '22P02') friendly = 'Alguns dados são inválidos. Revise o formulário.'
  else if (code === '23503') friendly = 'Esse registro está vinculado a outro que não existe mais. Recarregue a página.'
  else if (code === '42501' || code === 'PGRST301' || e.status === 401 || /jwt/i.test(msg)) friendly = 'Sua sessão expirou. Entre novamente.'
  else if (/failed to fetch|network|load failed/i.test(msg)) friendly = 'Sem conexão com o servidor. Verifique sua internet.'

  if (import.meta.env.DEV) console.error('[supabase]', error)
  return new Error(friendly, { cause: error })
}

/** Lança AppError se a resposta do Supabase trouxer erro; caso contrário retorna os dados. */
export function unwrap<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw toAppError(res.error)
  return res.data as T
}
