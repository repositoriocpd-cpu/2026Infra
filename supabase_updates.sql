-- Script de Atualização das Tabelas do Supabase
-- Execute este script no SQL Editor do Supabase

-- =============================================
-- VERIFICAR ESTRUTURA ATUAL DAS TABELAS
-- =============================================

-- Verificar estrutura da tabela fiscal_contracts
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'fiscal_contracts' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela fiscal_empenhos
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'fiscal_empenhos' 
ORDER BY ordinal_position;

-- =============================================
-- CONTAGEM DE REGISTROS
-- =============================================
SELECT 'fiscal_contracts' as tabela, COUNT(*) as total FROM fiscal_contracts
UNION ALL
SELECT 'fiscal_empenhos', COUNT(*) FROM fiscal_empenhos
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'handlers', COUNT(*) FROM handlers
UNION ALL
SELECT 'locations', COUNT(*) FROM locations;

-- =============================================
-- MIGRAÇÃO: Converter officers de array para texto
-- O novo sistema armazena fiscais como texto separado por vírgulas
-- =============================================

-- 1. Primeiro, verificar se officers é array (type: name[])
-- Se for array, converter para texto

-- Verificar dados atuais de officers
SELECT contract_number, officers, array_length(officers, 1) as qtd_fiscais
FROM fiscal_contracts 
WHERE officers IS NOT NULL
LIMIT 10;

-- 2. Adicionar coluna temporária para almacenar como texto
ALTER TABLE fiscal_contracts ADD COLUMN IF NOT EXISTS officers_text TEXT;

-- 3. Copiar dados do array para texto
UPDATE fiscal_contracts 
SET officers_text = array_to_string(officers, ', ')
WHERE officers IS NOT NULL AND officers_text IS NULL;

-- 4. Verificar resultado
SELECT contract_number, officers, officers_text
FROM fiscal_contracts 
WHERE officers_text IS NOT NULL
LIMIT 10;

-- =============================================
-- ADICIONAR COLUNA 'resource' NA TABELA fiscal_empenhos
-- Novo campo para armazenar informação de recurso
-- =============================================
ALTER TABLE fiscal_empenhos ADD COLUMN IF NOT EXISTS resource TEXT;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fiscal_empenhos' AND column_name = 'resource';