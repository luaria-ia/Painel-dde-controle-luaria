import { BarChart3, Bot, Handshake, Megaphone, TrendingUp } from 'lucide-react'
import type { StudyTrack } from '@/types/studies'
import { designSites } from './designSites'
import { plannedTrack } from './define'
import { socialMedia } from './socialMedia'

/**
 * Catálogo de trilhas. Nova trilha = um arquivo como socialMedia.ts + uma linha aqui.
 * Trilhas planejadas aparecem como "Próximas trilhas" até receberem módulos.
 */
export const STUDY_TRACKS: StudyTrack[] = [
  socialMedia,
  designSites,
  plannedTrack('ia-automacao', 'IA & Automação', Bot),
  plannedTrack('trafego-pago', 'Tráfego Pago', TrendingUp),
  plannedTrack('vendas', 'Vendas & Prospecção', Handshake),
  plannedTrack('marketing', 'Marketing', Megaphone),
  plannedTrack('gestao', 'Gestão', BarChart3),
]

export const ACTIVE_TRACKS = STUDY_TRACKS.filter((t) => !t.planned)
export const PLANNED_TRACKS = STUDY_TRACKS.filter((t) => t.planned)

export const findTrack = (id: string | undefined) => ACTIVE_TRACKS.find((t) => t.id === id)
