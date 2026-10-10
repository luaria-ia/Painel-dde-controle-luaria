-- =============================================================================
-- Migração: 20261009_market_radar.sql
-- Módulo: Radar de Mercado e Prospecção (Business OS)
--
-- Descrição:
--   Cria a tabela `market_prospects` para registrar e acompanhar empresas
--   prospectadas, oportunidades detectadas, fontes públicas e status comercial.
--   Conta com políticas de RLS estritas por `user_id`, FKs para `clients` e `board_cards`
--   com ON DELETE SET NULL, e índices otimizados para busca e filtragem.
--
-- ATENÇÃO:
--   Esta migração é versionada e documentada. NÃO execute no banco remoto
--   sem autorização e sem conexão prévia com o projeto de produção.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.market_prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  segment text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  channels jsonb NOT NULL DEFAULT '{}'::jsonb,
  sources_consulted text[] NOT NULL DEFAULT '{}'::text[],
  last_verified_at date,
  opportunities text NOT NULL DEFAULT '',
  observations text NOT NULL DEFAULT '',
  confidence_level text NOT NULL DEFAULT 'medio' CHECK (confidence_level IN ('baixo', 'medio', 'alto')),
  status text NOT NULL DEFAULT 'mapeada' CHECK (status IN ('mapeada', 'em_pesquisa', 'contatada', 'qualificada', 'descartada', 'convertida')),
  next_step text NOT NULL DEFAULT '',
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  board_card_id uuid REFERENCES public.board_cards(id) ON DELETE SET NULL,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE public.market_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa seus próprios prospects"
  ON public.market_prospects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_market_prospects_user_id ON public.market_prospects (user_id);
CREATE INDEX IF NOT EXISTS idx_market_prospects_status ON public.market_prospects (user_id, status);
CREATE INDEX IF NOT EXISTS idx_market_prospects_confidence ON public.market_prospects (user_id, confidence_level);
CREATE INDEX IF NOT EXISTS idx_market_prospects_client_id ON public.market_prospects (client_id);
