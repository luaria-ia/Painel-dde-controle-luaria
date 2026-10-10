import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmContext } from '@/components/ui/confirmContext'
import { ToastContext } from '@/components/ui/toastContext'
import { DataContext, type DataContextValue } from '@/store/DataContext'
import type { Client, Content, Project } from '@/types'
import { ProjectClientPage } from './ProjectClientPage'

vi.mock('@/lib/supabase', () => ({ supabase: {} }))

const base = { createdAt: '', updatedAt: '' }
const project = {
  ...base,
  id: 'sm',
  name: 'Social Media',
  description: '',
  status: 'ativo',
  color: 'amber',
  type: 'social_media',
  clientId: null,
  owners: [],
  startDate: null,
  dueDate: null,
  boardsProvisionedAt: null,
} as Project
const med = { ...project, id: 'med', name: 'Med Resumos', type: 'outro' } as Project
const client = (id: string, name: string) => ({ ...base, id, name, email: '', phone: '', whatsapp: '', company: '', notes: '', status: 'ativo', projectIds: ['sm'] }) as Client
const luan = client('luan', 'Luan Imóveis')
const vida = client('vida', 'Clínica Vida')
const content = (id: string, title: string, clientId: string, projectId = 'sm') =>
  ({ ...base, id, title, clientId, projectId, status: 'producao', type: 'post', description: '', plannedDate: null, publishDate: null, caption: '', cta: '', notes: '' }) as Content
const contents = [content('1', 'Post do Luan', 'luan'), content('2', 'Reels da Clínica', 'vida'), content('3', 'Outro projeto do Luan', 'luan', 'med')]

const data = {
  projects: [project, med],
  clients: [luan, vida],
  contents,
  tasks: [],
  files: [],
  events: [],
  projectById: new Map([
    [project.id, project],
    [med.id, med],
  ]),
  clientById: new Map([
    [luan.id, luan],
    [vida.id, vida],
  ]),
} as unknown as DataContextValue

const render = (path: string) =>
  renderToString(
    <ToastContext.Provider value={{ success: () => {}, error: () => {}, info: () => {} }}>
      <ConfirmContext.Provider value={async () => true}>
        <DataContext.Provider value={data}>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path="/projetos/:id/clientes/:clientId" element={<ProjectClientPage />} />
            </Routes>
          </MemoryRouter>
        </DataContext.Provider>
      </ConfirmContext.Provider>
    </ToastContext.Provider>,
  ).replace(/<!-- -->/g, '')

describe('Social Media → Cliente → Conteúdo', () => {
  it('mostra somente os conteúdos deste cliente neste projeto', () => {
    const html = render('/projetos/sm/clientes/luan?aba=conteudo')
    expect(html).toContain('Post do Luan')
    expect(html).not.toContain('Reels da Clínica') // outro cliente
    expect(html).not.toContain('Outro projeto do Luan') // mesmo cliente, outro projeto
    for (const tab of ['Visão geral', 'Estratégia', 'Conteúdo', 'Tarefas', 'Arquivos', 'Métricas', 'Atividade']) expect(html).toContain(tab)
  })
  it('a Clínica Vida vê só os dela', () => {
    const html = render('/projetos/sm/clientes/vida?aba=conteudo')
    expect(html).toContain('Reels da Clínica')
    expect(html).not.toContain('Post do Luan')
  })
  it('projeto sem espaço por cliente (Med Resumos) não abre esta página', () => {
    expect(render('/projetos/med/clientes/luan')).toContain('Cliente não encontrado neste projeto')
  })
})
