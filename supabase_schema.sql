-- Supabase Schema for Sistema de Gestão de Infraestrutura (Processos de Pagamento)

-- 1. Configuration Tables (Listas de opções do sistema)
CREATE TABLE public.suppliers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.objects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.statuses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.handlers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Core Processes Table
CREATE TABLE public.processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pp_number TEXT,
    exercise_year TEXT,
    pp_ano TEXT NOT NULL,
    cover_value TEXT,
    supplier_name TEXT,
    object_name TEXT,
    opening_date DATE,
    deadline DATE,
    treated_by TEXT,
    status TEXT,
    location TEXT,
    location_date DATE,
    situation TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Process History Table (Tramitações e Logs Manuais)
CREATE TABLE public.process_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
    history_date TEXT NOT NULL, -- Stored as string to match current JS logic (LocaleString)
    location_from TEXT, 
    location_to TEXT,
    message TEXT, -- For manual logs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Initial Data Seed (Defaults based on previous localStorage values)
INSERT INTO public.locations (name) VALUES 
('Secretaria'), ('Gabinete'), ('Finanças'), ('Protocolo'), 
('Compras'), ('Almoxarifado'), ('Tesouraria'), ('Nutrição') ON CONFLICT DO NOTHING;

INSERT INTO public.objects (name) VALUES 
('Compra de Material'), ('Prestação de Serviço') ON CONFLICT DO NOTHING;

INSERT INTO public.statuses (name) VALUES 
('Em Análise'), ('Aguardando Assinatura'), ('Concluído'), ('Pendente') ON CONFLICT DO NOTHING;

INSERT INTO public.handlers (name) VALUES 
('Gabinete'), ('Infraestrutura'), ('Administrativo') ON CONFLICT DO NOTHING;

INSERT INTO public.users (name) VALUES 
('Admin'), ('Operador') ON CONFLICT DO NOTHING;

-- Suppliers array from the existing code
INSERT INTO public.suppliers (name) VALUES 
('ANA DAS NEVES CAMPANHÃO'), ('C TEIXEIRA 110 COMERCIO DE ALIMENTOS LTDA'),
('COMERCIAL MILANO BRASIL LTDA'), ('DANIEL CARDOSO DE OLIVEIRA'),
('DISTRIBUIDORA BRAZLIMP LTDA'), ('DISTRIBUIDORA LIMPOLI EIRELI - ME'),
('EMPRESA SAP COMÉRCIO SERVIÇOS E DISTRIBUIÇÃO'), ('ESKINA DO GÁS REVENDEDOR DE GÁS LTDA'),
('GABRIEL QUEIROZ DA SILVA'), ('GUARAILHA DISTRIBUIDORA DE ALIMENTOS LTDA'),
('HERCÍLIA HARUMI IWANAGA'), ('HERMAN DINALDO SOARES FERREIRA'),
('INOVAR COMÉRCIO E SERVIÇO DE TERCEIRIZAÇÃO LTDA'), ('ITAMED COMÉRCIO E ARQUITETURA LTDA (CLIMATIZADORES)'),
('ITAMED COMÉRCIO E ARQUITETURA LTDA (MANUTENÇÃO)'), ('JOSÉ EDUARDO DA SILVA MEDINA'),
('LUMAR EMPREENDIMENTOS IMOBILIÁRIOS'), ('LUZIA FUGIKO YOSHY PACHECO'),
('MARCIO KOITY TAKENAKA'), ('MARIA LAURENÇO MORITA'),
('MÔNICA ASSIS DE ARAÚJO E SILVA'), ('PAULO ROBERTO MONTEIRO DA SILVA'),
('RG DISTRIBUIDORA, COMÉRCIO E SERVIÇOS LTDA'), ('ROSA MARIA MENDES MARINS DO NASCIMENTO'),
('SIBELLY TRANSPORTE LTDA (ALUGUEL)'), ('SIBELLY TRANSPORTE LTDA (GESTÃO)'),
('SOLANGE CANDIDA SOARES FERREIRA'), ('WILLIAM SHIOSE ALVES MOREIRA'),
('WILSON MASSALINO DE FREITAS') ON CONFLICT DO NOTHING;

-- 5. Row Level Security (RLS) policies - Permite acesso anônimo inicial para testes
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to all" ON public.processes FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to all" ON public.process_history FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to all" ON public.suppliers FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to all" ON public.locations FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to all" ON public.objects FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to all" ON public.statuses FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to all" ON public.handlers FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to all" ON public.users FOR ALL USING (true);
