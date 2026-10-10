import { Book, Bookmark, FileText, Globe, Wrench, LayoutTemplate, ListChecks, Newspaper, PlayCircle, Sparkles, type LucideIcon } from 'lucide-react'
import type { LibraryItemType } from '@/types/studies'

export const LIBRARY_TYPES: Record<LibraryItemType, { label: string; plural: string; icon: LucideIcon }> = {
  prompt: { label: 'Prompt', plural: 'Prompts', icon: Sparkles },
  template: { label: 'Template', plural: 'Templates', icon: LayoutTemplate },
  referencia: { label: 'Referência', plural: 'Referências', icon: Bookmark },
  site: { label: 'Site', plural: 'Sites', icon: Globe },
  artigo: { label: 'Artigo', plural: 'Artigos', icon: Newspaper },
  video: { label: 'Vídeo', plural: 'Vídeos', icon: PlayCircle },
  checklist: { label: 'Checklist', plural: 'Checklists', icon: ListChecks },
  material: { label: 'Material', plural: 'Materiais', icon: FileText },
  livro: { label: 'Livro', plural: 'Livros', icon: Book },
  ferramenta: { label: 'Ferramenta', plural: 'Ferramentas', icon: Wrench },
}
