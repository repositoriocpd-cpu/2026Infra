-- Adicionar coluna natureza na tabela suppliers
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS natureza TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS irrf NUMERIC;
