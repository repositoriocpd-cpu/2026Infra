-- Supabase Migration Script - Módulo Fiscal
-- Run this in the Supabase SQL Editor

-- 1. Update Existing Tables
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS razao_social TEXT;

-- 2. Create New Fiscal Tables
CREATE TABLE IF NOT EXISTS public.fiscal_officers (
    id SERIAL PRIMARY KEY,
    matricula TEXT,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fiscal_contracts (
    id SERIAL PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    process_number TEXT,
    contract_number TEXT NOT NULL UNIQUE,
    value NUMERIC,
    start_date DATE,
    end_date DATE,
    officers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fiscal_empenhos (
    id SERIAL PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    contract_number TEXT,
    period TEXT,
    officer_name TEXT,
    ne_number TEXT NOT NULL UNIQUE,
    value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fiscal_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year TEXT,
    month TEXT,
    supplier_name TEXT,
    contract_number TEXT,
    empenho_number TEXT,
    process_number TEXT,
    invoice_number TEXT,
    invoice_value NUMERIC,
    projected_balance NUMERIC,
    notes TEXT,
    status TEXT DEFAULT 'Pendente',
    competence TEXT,
    emission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.fiscal_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_empenhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_measurements ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies (Using existing helpers: is_admin, can_operate)

-- Officers
DROP POLICY IF EXISTS "Select Officers" ON public.fiscal_officers;
CREATE POLICY "Select Officers" ON public.fiscal_officers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Insert/Update Officers" ON public.fiscal_officers;
CREATE POLICY "Insert/Update Officers" ON public.fiscal_officers FOR ALL TO authenticated USING (public.can_operate());

-- Contracts
DROP POLICY IF EXISTS "Select Contracts" ON public.fiscal_contracts;
CREATE POLICY "Select Contracts" ON public.fiscal_contracts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Insert/Update Contracts" ON public.fiscal_contracts;
CREATE POLICY "Insert/Update Contracts" ON public.fiscal_contracts FOR ALL TO authenticated USING (public.can_operate());

-- Empenhos
DROP POLICY IF EXISTS "Select Empenhos" ON public.fiscal_empenhos;
CREATE POLICY "Select Empenhos" ON public.fiscal_empenhos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Insert/Update Empenhos" ON public.fiscal_empenhos;
CREATE POLICY "Insert/Update Empenhos" ON public.fiscal_empenhos FOR ALL TO authenticated USING (public.can_operate());

-- Measurements
DROP POLICY IF EXISTS "Select Measurements" ON public.fiscal_measurements;
CREATE POLICY "Select Measurements" ON public.fiscal_measurements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Insert/Update Measurements" ON public.fiscal_measurements;
CREATE POLICY "Insert/Update Measurements" ON public.fiscal_measurements FOR ALL TO authenticated USING (public.can_operate());
