import type { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmContext } from '@/components/ui/confirmContext'
import { ToastContext } from '@/components/ui/toastContext'
import { DataContext, type DataContextValue } from '@/store/DataContext'
import { StudiesContext, type StudiesContextValue } from '@/store/studiesContext'
import type { LibraryItem, StudyHourLog, StudyProgress } from '@/types/studies'
import { LibraryPage } from './LibraryPage'
import { StudiesPage } from './StudiesPage'
import { StudyExercisePage } from './StudyExercisePage'
import { StudyLessonPage } from './StudyLessonPage'
import { StudyModulePage } from './StudyModulePage'
import { StudyProjectPage } from './StudyProjectPage'
import { StudyProjectsPage } from './StudyProjectsPage'
import { StudySchedulePage } from './StudySchedulePage'
import { StudyToolsPage } from './StudyToolsPage'
import { StudyTrackPage } from './StudyTrackPage'

// Supabase não é usado aqui (os contextos são simulados), mas o módulo exige as variáveis.
vi.mock('@/lib/supabase', () => ({ supabase: {} }))

const base = { createdAt: '', updatedAt: '' }
const progress: StudyProgress[] = [
  { ...base, id: '1', itemId: 'social-media.m01.a1', kind: 'lesson', done: true, doneAt: '2026-10-05', answer: '', notes: 'minhas notas', checks: [0], level: null },
  { ...base, id: '2', itemId: 'social-media.m01.ex', kind: 'exercise', done: false, doneAt: null, answer: 'rascunho <b>', notes: '', checks: [], level: null },
  { ...base, id: '3', itemId: 'social-media.projeto', kind: 'project', done: false, doneAt: null, answer: 'Marmita <i>', notes: '', checks: [], level: null },
  { ...base, id: '4', itemId: 'social-media.projeto.empresa', kind: 'project', done: true, doneAt: '2026-10-05', answer: 'Texto da etapa', notes: '', checks: [], level: null },
  { ...base, id: '5', itemId: 'social-media.projeto.analise', kind: 'project', done: true, doneAt: '2026-10-05', answer: '', notes: '', checks: [], level: null },
  { ...base, id: '6', itemId: 'ferramenta.chatgpt', kind: 'tool', done: false, doneAt: null, answer: '', notes: '', checks: [], level: 2 },
]
const hours: StudyHourLog[] = [{ ...base, id: 'h1', date: '2026-10-05', minutes: 90, trackId: 'social-media', note: 'Planejamento' }]
const library: LibraryItem[] = [
  { ...base, id: 'l1', type: 'prompt', title: 'Ganchos <script>', url: 'javascript:alert(1)', content: 'texto', tags: ['reels'], trackId: 'social-media' },
]

const studies: StudiesContextValue = {
  ready: true,
  loadError: null,
  progress,
  progressMap: new Map(progress.map((p) => [p.itemId, p])),
  hours,
  library,
  saveProgress: async () => true,
  logHours: async () => null,
  deleteHours: async () => true,
  createLibraryItem: async () => null,
  updateLibraryItem: async () => null,
  deleteLibraryItem: async () => true,
}
const data = { clients: [], projects: [] } as unknown as DataContextValue
const toast = { success: () => {}, error: () => {}, info: () => {} }

function render(path: string, route: string, page: ReactElement) {
  const html = renderToString(
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={async () => true}>
        <DataContext.Provider value={data}>
          <StudiesContext.Provider value={studies}>
            <MemoryRouter initialEntries={[path]}>
              <Routes>
                <Route path={route} element={page} />
              </Routes>
            </MemoryRouter>
          </StudiesContext.Provider>
        </DataContext.Provider>
      </ConfirmContext.Provider>
    </ToastContext.Provider>,
  )
  return html.replace(/<!-- -->/g, '')
}

describe('páginas de Estudos renderizam', () => {
  it('Estudos (dashboard)', () => {
    const html = render('/estudos', '/estudos', <StudiesPage />)
    expect(html).toContain('Desenvolva habilidades, pratique e transforme conhecimento em projetos reais.')
    expect(html).toContain('Social Media')
    expect(html).toContain('Design de Sites')
    expect(html).toContain('Próximas trilhas')
    expect(html).toContain('1h30')
  })
  it('Trilha', () => {
    const html = render('/estudos/social-media', '/estudos/:trackId', <StudyTrackPage />)
    expect(html).toContain('Fundamentos de Social Media')
    expect(html).toContain('Em andamento')
    expect(html).toContain('Trilha de 14 dias')
    expect(html).toContain('Projeto Final')
  })
  it('Trilha inexistente mostra aviso', () => {
    expect(render('/estudos/xyz', '/estudos/:trackId', <StudyTrackPage />)).toContain('Trilha não encontrado')
  })
  it('Módulo', () => {
    const html = render('/estudos/social-media/m01', '/estudos/:trackId/:moduleKey', <StudyModulePage />)
    expect(html).toContain('O que faz um social media')
    expect(html).toContain('Rascunho salvo')
  })
  it('Aula com todas as partes e negrito seguro', () => {
    const html = render('/estudos/social-media/m01/aula/a1', '/estudos/:trackId/:moduleKey/aula/:lessonKey', <StudyLessonPage />)
    for (const part of [
      'Objetivo da aula',
      'Explicação',
      'Conceitos principais',
      'Exemplo prático',
      'Aplicando na prática',
      'Exercício da aula',
      'Checklist',
      'Minhas anotações',
      'Concluída em',
      'Reabrir aula',
    ])
      expect(html).toContain(part)
    expect(html).toContain('minhas notas')
    expect(html).toContain('<strong class="font-semibold text-fg">planejar, produzir, publicar e analisar</strong>')
    expect(html).not.toContain('**')
  })
  it('Aula com tabela no exemplo (Design de Sites)', () => {
    const html = render('/estudos/design-sites/m01/aula/a2', '/estudos/:trackId/:moduleKey/aula/:lessonKey', <StudyLessonPage />)
    expect(html).toContain('<table')
    expect(html).toContain('Começar aula')
  })
  it('Cronograma de 14 dias', () => {
    const html = render('/estudos/social-media/cronograma', '/estudos/:trackId/cronograma', <StudySchedulePage />)
    expect(html).toContain('id="dia-14"')
    expect(html).toContain('Projeto final: seu primeiro case')
  })
  it('Ferramentas de IA com nível salvo', () => {
    const html = render('/ferramentas-ia', '/ferramentas-ia', <StudyToolsPage />)
    expect(html).toContain('BestContent')
    expect(html).toContain('Intermediário')
  })
  it('Exercício escapa o texto do usuário', () => {
    const html = render('/estudos/social-media/m01/exercicio', '/estudos/:trackId/:moduleKey/exercicio', <StudyExercisePage />)
    expect(html).toContain('Inserir modelo')
    expect(html).toContain('rascunho &lt;b&gt;')
    expect(html).toContain('Análise de 3 perfis reais')
    expect(html).toContain('Em andamento')
  })
  it('Projeto final', () => {
    const html = render('/estudos/social-media/projeto', '/estudos/:trackId/projeto', <StudyProjectPage />)
    expect(html).toContain('2/16 etapas')
    expect(html).toContain('Marmita &lt;i&gt;')
    expect(html).toContain('Texto da etapa')
    expect(html).toContain('Exportar projeto (.md)')
  })
  it('Projetos de estudo', () => {
    expect(render('/projetos-de-estudo', '/projetos-de-estudo', <StudyProjectsPage />)).toContain('Landing page profissional para uma empresa fictícia')
  })
  it('Biblioteca: escapa título e não cria link javascript:', () => {
    const html = render('/biblioteca', '/biblioteca', <LibraryPage />)
    expect(html).toContain('Ganchos &lt;script&gt;')
    expect(html).not.toContain('href="javascript:')
  })
})
