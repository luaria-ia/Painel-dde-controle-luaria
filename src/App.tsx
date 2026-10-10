import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { useAuth } from '@/auth/authContext'
import { RequireAuth } from '@/auth/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { ConfirmProvider } from '@/components/ui/ConfirmDialog'
import { ToastProvider } from '@/components/ui/Toast'
import { LoginPage } from '@/pages/LoginPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { DataProvider } from '@/store/DataProvider'

// Páginas carregadas sob demanda (cada rota vira um chunk; o Recharts só baixa no Financeiro).
const ClientDetailPage = lazy(() => import('@/pages/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })))
const ClientsPage = lazy(() => import('@/pages/ClientsPage').then((m) => ({ default: m.ClientsPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const FinancePage = lazy(() => import('@/pages/FinancePage').then((m) => ({ default: m.FinancePage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })))
const BoardPage = lazy(() => import('@/pages/BoardPage').then((m) => ({ default: m.BoardPage })))
const ProjectClientPage = lazy(() => import('@/pages/ProjectClientPage').then((m) => ({ default: m.ProjectClientPage })))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const TasksPage = lazy(() => import('@/pages/TasksPage').then((m) => ({ default: m.TasksPage })))
// V2
const CalendarPage = lazy(() => import('@/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })))
const ContractsPage = lazy(() => import('@/pages/ContractsPage').then((m) => ({ default: m.ContractsPage })))
const ContractDetailPage = lazy(() => import('@/pages/ContractDetailPage').then((m) => ({ default: m.ContractDetailPage })))
const ContentPage = lazy(() => import('@/pages/ContentPage').then((m) => ({ default: m.ContentPage })))
const FilesPage = lazy(() => import('@/pages/FilesPage').then((m) => ({ default: m.FilesPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })))
// Central de Agentes de IA
const AgentsPage = lazy(() => import('@/pages/AgentsPage').then((m) => ({ default: m.AgentsPage })))
// V3 & Mercado
const MarketRadarPage = lazy(() => import('@/pages/MarketRadarPage').then((m) => ({ default: m.MarketRadarPage })))
const AssistantPage = lazy(() => import('@/pages/AssistantPage').then((m) => ({ default: m.AssistantPage })))
const KnowledgePage = lazy(() => import('@/pages/KnowledgePage').then((m) => ({ default: m.KnowledgePage })))
const AutomationsPage = lazy(() => import('@/pages/AutomationsPage').then((m) => ({ default: m.AutomationsPage })))

/** Área logada. O `key` garante que trocar de usuário descarta todo o estado anterior. */
function PrivateApp() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      <DataProvider key={user?.id}>
        <AppLayout />
      </DataProvider>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="entrar" element={<LoginPage />} />
              <Route path="redefinir-senha" element={<ResetPasswordPage />} />
              <Route element={<PrivateApp />}>
                <Route index element={<DashboardPage />} />
                <Route path="projetos" element={<ProjectsPage />} />
                <Route path="projetos/:id" element={<ProjectDetailPage />} />
                <Route path="projetos/:id/quadros/:boardId" element={<BoardPage />} />
                <Route path="projetos/:id/clientes/:clientId" element={<ProjectClientPage />} />
                <Route path="tarefas" element={<TasksPage />} />
                <Route path="clientes" element={<ClientsPage />} />
                <Route path="clientes/:id" element={<ClientDetailPage />} />
                <Route path="calendario" element={<CalendarPage />} />
                <Route path="contratos" element={<ContractsPage />} />
                <Route path="contratos/:id" element={<ContractDetailPage />} />
                <Route path="conteudo" element={<ContentPage />} />
                <Route path="arquivos" element={<FilesPage />} />
                <Route path="financeiro" element={<FinancePage />} />
                <Route path="relatorios" element={<ReportsPage />} />
                <Route path="agentes" element={<AgentsPage />} />
                <Route path="radar" element={<MarketRadarPage />} />
                <Route path="assistente" element={<AssistantPage />} />
                <Route path="conhecimento" element={<KnowledgePage />} />
                <Route path="automacoes" element={<AutomationsPage />} />
                <Route path="configuracoes" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  )
}
