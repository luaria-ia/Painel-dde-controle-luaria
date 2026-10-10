-- Migração: Central de Agentes de IA
-- Data: 2026-10-09
-- Autor: Business OS

-- 1. Departamentos de Agentes
create table if not exists public.ai_departments (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  slug text not null,
  name text not null,
  description text not null default '',
  color text not null default '#6366f1',
  accent_glow text not null default 'rgba(99, 102, 241, 0.35)',
  icon_name text not null default 'Bot',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Agentes de IA
create table if not exists public.ai_agents (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  slug text not null,
  name text not null,
  role text not null,
  department_slug text not null,
  description text not null default '',
  primary_goal text not null default '',
  system_instructions text not null default '',
  model text not null default 'llama3.2:latest',
  provider text not null default 'ollama',
  temperature numeric not null default 0.7,
  authorized_tools text[] not null default '{}',
  status text not null default 'ativo',
  avatar_icon text not null default 'Bot',
  execution_count integer not null default 0,
  success_rate integer not null default 100,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Histórico de Execuções dos Agentes
create table if not exists public.ai_agent_executions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  agent_id text not null,
  agent_name text not null,
  department_slug text not null,
  task_title text not null,
  prompt text not null,
  output text not null default '',
  duration_ms integer not null default 0,
  tokens_count integer not null default 0,
  status text not null default 'concluido',
  error_message text,
  requires_approval boolean not null default false,
  approval_id text,
  source_module text not null default 'manual',
  context_entity_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Fila de Aprovações Humanas
create table if not exists public.ai_agent_approvals (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  execution_id text not null,
  agent_id text not null,
  agent_name text not null,
  department_slug text not null,
  title text not null,
  description text not null default '',
  action_type text not null default 'outro',
  content_to_approve text not null,
  payload jsonb default '{}'::jsonb,
  status text not null default 'pendente',
  resolved_at timestamptz,
  feedback_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Políticas de RLS
alter table public.ai_departments enable row level security;
alter table public.ai_agents enable row level security;
alter table public.ai_agent_executions enable row level security;
alter table public.ai_agent_approvals enable row level security;

create policy "Usuários gerenciam seus próprios departamentos" on public.ai_departments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuários gerenciam seus próprios agentes" on public.ai_agents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuários gerenciam suas próprias execuções de IA" on public.ai_agent_executions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuários gerenciam suas aprovações de agentes" on public.ai_agent_approvals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Índices para performance
create index if not exists idx_ai_agents_department on public.ai_agents(department_slug);
create index if not exists idx_ai_agent_executions_created on public.ai_agent_executions(created_at desc);
create index if not exists idx_ai_agent_approvals_status on public.ai_agent_approvals(status);
