import type { SupabaseClient } from '@supabase/supabase-js'
import { unwrap } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import type { LibraryItem, StudyHourLog, StudyItemKind, StudyProgress, StudyProgressPatch } from '@/types/studies'
import { createSupabaseRepository, fromRow, toRow } from './createSupabaseRepository'

const db = supabase as unknown as SupabaseClient

/** Progresso: uma linha por aula/exercício/projeto, gravada com upsert (user_id + item_id). */
export const studyProgressRepository = {
  async list(): Promise<StudyProgress[]> {
    const rows = unwrap(await db.from('study_progress').select('*'))
    return (rows as Record<string, unknown>[]).map((r) => fromRow<StudyProgress>(r))
  },
  /** Envia só os campos do patch: os demais ficam como estão no banco. */
  async upsert(itemId: string, kind: StudyItemKind, patch: StudyProgressPatch): Promise<StudyProgress> {
    const row = unwrap(
      await db
        .from('study_progress')
        .upsert({ item_id: itemId, kind, ...toRow(patch) }, { onConflict: 'user_id,item_id' })
        .select('*')
        .single(),
    )
    return fromRow<StudyProgress>(row as unknown as Record<string, unknown>)
  },
}

export const studyHoursRepository = createSupabaseRepository<StudyHourLog>({
  table: 'study_hours',
  order: { column: 'date', ascending: false },
})

export const libraryRepository = createSupabaseRepository<LibraryItem>({
  table: 'study_library',
  order: { column: 'updated_at', ascending: false },
})
