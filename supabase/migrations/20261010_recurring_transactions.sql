-- Migration: Add recurrence columns to transactions table for monthly subscriptions / expenses
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recurrence_period TEXT DEFAULT 'mensal';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recurring_day INTEGER;

COMMENT ON COLUMN public.transactions.recurring IS 'Indica se o lançamento é recorrente mensal (mensalidade de cliente ou custo fixo).';
COMMENT ON COLUMN public.transactions.recurrence_period IS 'Período da recorrência (mensal ou nenhuma).';
COMMENT ON COLUMN public.transactions.recurring_day IS 'Dia de vencimento da recorrência no mês (1 a 31).';
