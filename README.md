# Business OS

Business OS — plataforma integrada de gestão empresarial, projetos, clientes, tarefas, finanças, estudos e produção de conteúdo com inteligência artificial. Desenvolvido com React, TypeScript e Supabase, com foco em produtividade, automação e escalabilidade.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção em dist/
npm run lint
npm test         # testes da cascata de IA
npm run deploy   # build + publica no Cloudflare Pages (https://business-os-a5w.pages.dev)
```

Requer `.env.local` (modelo em `.env.example`) com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Deploy na Vercel

O deploy existente para Cloudflare Pages continua disponível por `npm run deploy`. Para Vercel, o repositório inclui `vercel.json`:

- Framework: Vite (detecção automática).
- Install: `npm ci`.
- Build: `npm run build`.
- Output: `dist`.
- As rotas do React Router são reescritas para `index.html`; cabeçalhos de segurança e cache também estão configurados para Vercel. O arquivo `public/_headers` continua atendendo Cloudflare Pages.
- Node.js: `>=22.12.0` (compatível com a versão de Vite usada neste projeto).

Para conectar: importe o repositório GitHub na Vercel, mantenha a raiz do projeto como `/`, confira os comandos acima e configure as variáveis de ambiente para Production, Preview e Development conforme necessário:

| Variável | Obrigatória | Onde configurar |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave publishable do Supabase; é pública e será incluída no frontend |

Use os valores do seu projeto; não copie credenciais para o repositório. O arquivo `.env.example` contém apenas marcadores fictícios. Configure também a URL da implantação em Supabase Auth → URL Configuration (Site URL e Redirect URLs), incluindo `/redefinir-senha` no domínio usado.

A Edge Function de IA valida a origem do navegador. Depois de implantar a aplicação, adicione no Supabase o segredo `AI_ALLOWED_ORIGINS` com os domínios Vercel permitidos separados por vírgula (por exemplo, `https://seu-app.vercel.app,https://www.seu-dominio.com`) e reimplante a função `ai`. Origens locais e o domínio atual do Cloudflare continuam permitidos. Inclua domínios de preview apenas se quiser testar IA nesses previews.

O deploy da Vercel não publica as Edge Functions nem configura o banco Supabase. As chaves dos provedores de IA (`GEMINI_API_KEY`, `GEMINI_PAID_API_KEY` e/ou `ANTHROPIC_API_KEY`) devem permanecer como segredos no Supabase, nunca como variáveis `VITE_*`.

## Stack

React 19 + TypeScript + Vite · Tailwind CSS v4 · React Router · Lucide · Recharts · **Supabase** (Postgres + Auth) · **Cloudflare Pages**.

## Estrutura

```
src/
  config/          app.ts (nome, locale), labels.ts (status/prioridades/cores), navigation.ts (menu)
  types/           entidades: Project, Task, Client, Transaction, Settings
  lib/             format.ts (moeda/datas), selectors.ts (cálculos puros), utils.ts
  services/
    dataService.ts regras entre entidades: seed, limpeza de exemplos, backup
  repositories/    repositórios Supabase (project, task, client, transaction, settings)
  auth/            AuthProvider, RequireAuth, tela pública (login / redefinir senha)
  data/seed.ts     dados iniciais (3 projetos reais + exemplos marcados com isDemo)
  store/           DataProvider (estado global + ações) e hook useData()
  hooks/           useFormState, useTaskActions, useTheme
  components/
    ui/            Button, Card, Badge, Field/Input/Select/Textarea, Modal, ConfirmDialog, Toast, Table, Menu, Segmented, EmptyState
    layout/        AppLayout, Sidebar, MobileNav, PageHeader, Logo
    projects/ tasks/ clients/ finance/ common/   componentes de domínio (cards, listas, formulários, Kanban)
  pages/           Dashboard, Projetos, Projeto, Tarefas, Clientes, Cliente, Financeiro, Configurações
```

Fluxo de dados: `página → useData() → DataProvider → dataService/repositories → Supabase`.
Nenhum componente fala com o banco diretamente.

## Modelo de dados

- **Cliente ↔ Projeto**: N:N (`client.projectIds`).
- **Tarefa**: `projectId` e `clientId` opcionais.
- **Transaction** (receita/despesa): `projectId`, `clientId` (só receitas), `status`, valor em **centavos**.
- Excluir projeto/cliente **não apaga** tarefas e lançamentos — apenas desvincula.
- Registros com `isDemo: true` são removidos em Configurações → “Remover exemplos”.

## Segurança

- **Login obrigatório** (Supabase Auth, e-mail + senha). Sem tela de cadastro.
- **Allowlist no banco**: um trigger em `auth.users` só aceita e-mails da tabela `private.allowed_emails`.
- **RLS em todas as tabelas**: cada linha tem `user_id` e só o dono lê/escreve. O papel `anon` não tem permissão nenhuma.
- **FKs compostas `(id, user_id)`**: impossível vincular uma tarefa/lançamento a dados de outro usuário.
- **Validação no banco** (CHECKs de tamanho, status, valores) além da validação dos formulários.
- **Cabeçalhos HTTP** (`public/_headers`): CSP restritiva sem scripts inline, HSTS, anti-iframe, nosniff, noindex.
- A chave `VITE_SUPABASE_PUBLISHABLE_KEY` é pública por natureza; nunca colocar a `service_role` no front.

## IA

- Edge Function `supabase/functions/ai` (Supabase). As chaves ficam só como segredos do servidor:
  `GEMINI_API_KEY` (Google, plano grátis — padrão) e/ou `ANTHROPIC_API_KEY` (Claude, pago).
- Sem chave, o app usa o modo demonstração (respostas por regras, marcadas como “Demonstração”).
- Camadas: UI → `services/ai/aiService` → `contextBuilder` + `promptBuilder` → provedor (servidor ou demo).
- **Cascata Gemini Free → Free → Free → Paid** com retry, fallback, circuit breaker e registro de custo: veja [docs/AI_CASCADE.md](docs/AI_CASCADE.md).

## Estudos (Aprendizado)

- Rotas: `/estudos`, `/estudos/:trilha`, `/estudos/:trilha/:modulo`, `.../aula/:aula`, `.../exercicio`, `/estudos/:trilha/projeto`, `/estudos/:trilha/cronograma`, `/biblioteca`, `/projetos-de-estudo`, `/ferramentas-ia`.
- **Catálogo em código** (`src/data/studies`): cada trilha é um objeto (`defineTrack`) com módulos → aulas/exercício e projeto final.
  Nova trilha = um arquivo como `socialMedia.ts` + uma linha em `src/data/studies/index.ts`. Trilhas `plannedTrack(...)` aparecem como "Próximas trilhas".
  Nunca renomeie chaves (`m01`, `a1`) — o progresso é salvo por elas. Checklists e etapas: acrescente itens só no fim.
- **Dados do usuário no Supabase** (RLS por usuário): `study_progress` (aula/exercício/projeto: concluído, resposta, anotações, checklist),
  `study_hours` e `study_library`. Carregados só nas páginas de Aprendizado (`StudiesProvider`).
- Conteúdo das aulas usa blocos seguros (`RichBlock`: texto com **negrito**/*itálico*, tabela, prompt, lista) — nunca HTML.
- Projeto final: uma linha de progresso por etapa (`trilha.projeto.<etapa>`: texto + concluída); exportação em `.md`.
- Ferramentas de IA (`/ferramentas-ia`): nível de domínio salvo como `ferramenta.<id>` (o mesmo em todas as trilhas).
- Cronograma de 14 dias: cada aula tem `day`; o exercício aparece no último dia do módulo.
- Progresso = aulas 60% + exercícios 25% + projeto final 15% (`src/lib/studies.ts`, com testes).

## Projetos, tipos e áreas (workflows)

CLIENTE → PROJETOS → TIPO → ÁREAS (abas do projeto). Kanban não é módulo global: é a interface de workflow de uma área.

- Tipos em `src/data/boards/projectTypes.ts`: cada `ProjectTypeDef` declara `areas` (abas próprias), `boards` (templates que guardam
  os dados das áreas) e `tabs` (abas nativas relevantes; ausente = todas). Ex.: `luaria_ai` → CRM + Marketing;
  `social_media` → Estratégia (dossiê) + Conteúdo (Kanban) + Métricas; `luaria_ai_cliente`, `web_design`, `trafego_pago`;
  `outro` (Med Resumos) mantém as abas originais. Novo tipo = um objeto a mais.
- Tipos de área: `kanban` (BoardWorkspace), `dossier` (seções permanentes, DossierView), `metrics` (painel calculado),
  `contents` (Kanban do módulo Conteúdo filtrado por projeto+cliente) e `contents-metrics`.
- **Projeto-operação** (`clientWorkspace`, ex.: Social Media): o projeto gerencia a operação (aba Clientes, visão agregada);
  cada cliente tem o próprio espaço em `/projetos/:id/clientes/:cliente` (Estratégia, Conteúdo, Tarefas, Arquivos, Métricas,
  Atividade), com tudo isolado por `project_id + client_id`. O cliente entra na operação via `client_projects`; a Estratégia
  dele é um quadro com `boards.client_id` (`provision_client_board`).
- Armazenamento: tabelas `boards`, `board_lists`, `board_labels`, `board_cards`, `board_card_comments`, `board_card_events`
  (+ `files.board_card_id` para anexos). `create_project` cria projeto + quadros das áreas numa transação; `useAreaBoard`
  cria na hora o que faltar.
- Projeto pertence a um cliente (`projects.client_id`); `client.projectIds` é calculado ao carregar.
- **Lead → cliente**: oportunidades do CRM (`role: 'crm'`) têm “Converter em cliente” (`board_cards.client_id`), que sugere vincular
  a um cadastro existente (`src/lib/leads.ts`) em vez de duplicar. O histórico comercial aparece na página do cliente.
- Automações (`src/lib/boards.ts → evaluateAutomations`): ao entrar numa lista ou receber etiqueta → etiqueta, concluir, criar tarefa.
- Links antigos `/projetos/:id/quadros/:quadro` redirecionam para a área correspondente.

Banco: projeto Supabase `business-os` (sa-east-1). Exclusões em cascata via `ON DELETE SET NULL`.

## Radar de Mercado & Prospecção (V3)

Módulo de prospecção ativa e mapeamento comercial em `/radar`:
- Cadastro de empresas prospectadas com segmento, localização, canais públicos e websites.
- Checklist de fontes públicas consultadas e data da última verificação.
- Mapeamento de oportunidades comerciais e registro de hipóteses estratégicas (com disclaimer de validação).
- Nível de confiança da inteligência levantada e status comercial.
- Ações rápidas de conversão com 1 clique: **Converter em Cliente** ou **Enviar para Funil Comercial (CRM)**.
- Persistência transparente com fallback local e migração versionada disponível em `supabase/migrations/20261009_market_radar.sql`.

## Adicionar um módulo (V2/V3)

1. Tabela + RLS no Supabase, tipo em `src/types`, repositório em `src/repositories`, ações no `DataProvider`.
2. Página em `src/pages` e rota em `src/App.tsx`.
3. Item de menu em `src/config/navigation.ts`.
