-- Script de Atualização das Tabelas do Supabase
-- Execute este script no SQL Editor do Supabase para aplicar as mudanças do novo sistema

-- =============================================
-- 1. Verificar estrutura atual das tabelas
-- =============================================

-- fiscal_contracts
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'fiscal_contracts' 
ORDER BY ordinal_position;

-- fiscal_empenhos  
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'fiscal_empenhos' 
ORDER BY ordinal_position;

-- =============================================
-- 2. Adicionar coluna 'resource' em fiscal_empenhos (se não existir)
-- =============================================
ALTER TABLE fiscal_empenhos ADD COLUMN IF NOT EXISTS resource TEXT;

-- =============================================
-- 3. Migrar campo officers de JSONB para TEXT (se necessário)
-- =============================================

-- Verificar se o campo officers é JSONB
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'fiscal_contracts' AND column_name = 'officers';

-- Se officers for JSONB, criar uma nova coluna TEXT e migrar os dados
-- Isso é necessário porque o novo sistema envia string texto (não JSON)

-- 3.1. Adicionar coluna temporária como TEXT
ALTER TABLE fiscal_contracts ADD COLUMN IF NOT EXISTS officers_text TEXT;

-- 3.2. Converter JSONB para texto
UPDATE fiscal_contracts 
SET officers_text = array_to_string(ARRAY(SELECT jsonb_array_elements_text(officers)), ', ')
WHERE officers IS NOT NULL AND officers_text IS NULL;

-- 3.3. Verificar resultado
SELECT contract_number, officers as officers_jsonb, officers_text 
FROM fiscal_contracts 
WHERE officers IS NOT NULL
LIMIT 5;

-- =============================================
-- 4. Contagem de registros para verificação
-- =============================================
SELECT 'fiscal_contracts' as tabela, COUNT(*) as total FROM fiscal_contracts
UNION ALL
SELECT 'fiscal_empenhos', COUNT(*) FROM fiscal_empenhos
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'handlers', COUNT(*) FROM handlers;

-- =============================================
-- 5. Verificar dados existentes (amostra)
-- =============================================
SELECT contract_number, supplier_name, officers_text as fiscais 
FROM fiscal_contracts 
WHERE officers_text IS NOT NULL
LIMIT 5;

SELECT ne_number, supplier_name, contract_number, resource, period
FROM fiscal_empenhos 
LIMIT 5;