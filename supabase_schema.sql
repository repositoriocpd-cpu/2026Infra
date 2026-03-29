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

-- 5. User Profiles Table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    department TEXT,
    role TEXT CHECK (role IN ('administrador', 'operador', 'convidado')) DEFAULT 'convidado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Row Level Security (RLS) policies
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function para verificar administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Permite bypass para o email do CPD em caso base
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) = 'cpdinfra@edu.itaguai.rj.gov.br' THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function para verificar operações (admin ou operador)
CREATE OR REPLACE FUNCTION public.can_operate()
RETURNS BOOLEAN AS $$
BEGIN
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) = 'cpdinfra@edu.itaguai.rj.gov.br' THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('administrador', 'operador')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- POLÍTICAS PARA USER PROFILES
-- ==========================================
CREATE POLICY "Perfis visiveis para autenticados" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios podem criar proprio perfil ou admin" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY "Usuarios atualizam proprio perfil ou admin" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Apenas admin pode deletar perfil" ON public.user_profiles FOR DELETE TO authenticated USING (public.is_admin());

-- ==========================================
-- POLÍTICAS PARA PROCESSOS
-- ==========================================
CREATE POLICY "Leitura de processos para logados" ON public.processes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Adicao de processos apenas por operadores" ON public.processes FOR INSERT TO authenticated WITH CHECK (public.can_operate());
CREATE POLICY "Atualizacao de processos por operadores" ON public.processes FOR UPDATE TO authenticated USING (public.can_operate());
CREATE POLICY "Deletar processos apenas por admin" ON public.processes FOR DELETE TO authenticated USING (public.is_admin());

-- ==========================================
-- POLÍTICAS PARA HISTÓRICO DE PROCESSOS
-- ==========================================
CREATE POLICY "Leitura historico para logados" ON public.process_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Adicao historico apenas operadores" ON public.process_history FOR INSERT TO authenticated WITH CHECK (public.can_operate());
CREATE POLICY "Atualizacao historico apenas operadores" ON public.process_history FOR UPDATE TO authenticated USING (public.can_operate());
CREATE POLICY "Deletar historico apenas por admin" ON public.process_history FOR DELETE TO authenticated USING (public.is_admin());

-- ==========================================
-- POLÍTICAS PARA TABELAS AUXILIARES E CONFIGURAÇÕES
-- ==========================================
-- (Leitura para todos os logados, Escrita apenas para Admin)

-- SUPLLIERS
CREATE POLICY "Leitura lib para auth" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.suppliers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LOCATIONS
CREATE POLICY "Leitura lib para auth" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.locations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- OBJECTS
CREATE POLICY "Leitura lib para auth" ON public.objects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.objects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- STATUSES
CREATE POLICY "Leitura lib para auth" ON public.statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.statuses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- HANDLERS
CREATE POLICY "Leitura lib para auth" ON public.handlers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.handlers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- USERS (Listagem Front-End)
CREATE POLICY "Leitura lib para auth" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.users FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

