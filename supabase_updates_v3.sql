-- 1. Verificar estrutura fiscal_contracts
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'fiscal_contracts' 
ORDER BY ordinal_position;

-- 2. Verificar estrutura fiscal_empenhos  
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'fiscal_empenhos' 
ORDER BY ordinal_position;

-- 3. Adicionar coluna resource em fiscal_empenhos
ALTER TABLE fiscal_empenhos ADD COLUMN IF NOT EXISTS resource TEXT;

-- 4. Adicionar coluna officers_text em fiscal_contracts
ALTER TABLE fiscal_contracts ADD COLUMN IF NOT EXISTS officers_text TEXT;

-- 5. Converter officers JSONB para texto
UPDATE fiscal_contracts 
SET officers_text = array_to_string(ARRAY(SELECT jsonb_array_elements_text(officers)), ', ')
WHERE officers IS NOT NULL AND officers_text IS NULL;

-- 6. Verificar resultado da conversão
SELECT contract_number, officers as officers_jsonb, officers_text 
FROM fiscal_contracts 
WHERE officers IS NOT NULL
LIMIT 5;

-- 7. Contagem de registros
SELECT 'fiscal_contracts' as tabela, COUNT(*) as total FROM fiscal_contracts
UNION ALL
SELECT 'fiscal_empenhos', COUNT(*) FROM fiscal_empenhos
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'handlers', COUNT(*) FROM handlers;