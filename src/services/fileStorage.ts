import { toAppError } from '@/lib/errors'
import { supabase } from '@/lib/supabase'

/**
 * Upload/download de arquivos no Supabase Storage (bucket privado "files").
 * Caminho: {user_id}/{uuid}-{nome}. As policies do Storage só deixam cada usuário
 * acessar a própria pasta. Links de download são assinados e expiram.
 */
const BUCKET = 'files'
export const MAX_FILE_BYTES = 25 * 1024 * 1024

export const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

/** Valida antes de enviar (o bucket também valida no servidor). */
export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) return 'Arquivo maior que 25 MB.'
  if (file.type && !ACCEPTED_TYPES.includes(file.type)) return 'Tipo de arquivo não permitido.'
  return null
}

function safeName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .slice(-80)
}

export async function uploadFile(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sua sessão expirou. Entre novamente.')
  const path = `${auth.user.id}/${crypto.randomUUID()}-${safeName(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (error) throw toAppError(error)
  return path
}

export async function removeStoredFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw toAppError(error)
}

/** Link temporário (5 min) para abrir/baixar. */
export async function getFileUrl(path: string, download = false): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300, { download })
  if (error || !data) throw toAppError(error)
  return data.signedUrl
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}
