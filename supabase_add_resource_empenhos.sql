-- Migration: Adicionar campo 'Recurso' na tabela fiscal_empenhos
-- Data: 2026-04-14
-- Descrição: Adiciona a coluna 'resource' do tipo TEXT para armazenar
--            o recurso orçamentário vinculado ao empenho.

ALTER TABLE fiscal_empenhos
ADD COLUMN IF NOT EXISTS resource TEXT;

-- Verificação (opcional): confirmar que a coluna foi criada
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'fiscal_empenhos'
  AND column_name = 'resource';
