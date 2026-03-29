-- ==========================================
-- SCRIPT DE ATUALIZAÇÃO SÓ PARA AS POLÍTICAS DE RLS (SUPABASE)
-- Rodar este script caso as tabelas básicas (suppliers, processes, etc.) já existam.
-- ==========================================

-- 1. Cria a nova tabela de perfis (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    department TEXT,
    role TEXT CHECK (role IN ('administrador', 'operador', 'convidado')) DEFAULT 'convidado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita/Confirma que o Row Level Security está ativo para todas as tabelas
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. DESTRÓI as políticas antigas fracas do Banco (Caso Existam)
DROP POLICY IF EXISTS "Allow anonymous access to all" ON public.processes;
DROP POLICY IF EXISTS "Allow anonymous access to all" ON public.process_history;
DROP POLICY IF EXISTS "Allow anonymous access to all" ON public.suppliers;
DROP POLICY IF EXISTS "Allow anonymous access to all" ON public.locations;
DROP POLICY IF EXISTS "Allow anonymous access to all" ON public.objects;
DROP POLICY IF EXISTS "Allow anonymous access to all" ON public.statuses;
DROP POLICY IF EXISTS "Allow anonymous access to all" ON public.handlers;
DROP POLICY IF EXISTS "Allow anonymous access to all" ON public.users;

-- Tenta dropar as novas também para permitir que o script possa rodar mais de uma vez sem dar erro
DROP POLICY IF EXISTS "Perfis visiveis para autenticados" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuarios podem criar proprio perfil ou admin" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuarios atualizam proprio perfil ou admin" ON public.user_profiles;
DROP POLICY IF EXISTS "Apenas admin pode deletar perfil" ON public.user_profiles;
DROP POLICY IF EXISTS "Leitura de processos para logados" ON public.processes;
DROP POLICY IF EXISTS "Adicao de processos apenas por operadores" ON public.processes;
DROP POLICY IF EXISTS "Atualizacao de processos por operadores" ON public.processes;
DROP POLICY IF EXISTS "Deletar processos apenas por admin" ON public.processes;
DROP POLICY IF EXISTS "Leitura historico para logados" ON public.process_history;
DROP POLICY IF EXISTS "Adicao historico apenas operadores" ON public.process_history;
DROP POLICY IF EXISTS "Atualizacao historico apenas operadores" ON public.process_history;
DROP POLICY IF EXISTS "Deletar historico apenas por admin" ON public.process_history;
DROP POLICY IF EXISTS "Leitura lib para auth" ON public.suppliers;
DROP POLICY IF EXISTS "Escrita admin" ON public.suppliers;
DROP POLICY IF EXISTS "Leitura lib para auth" ON public.locations;
DROP POLICY IF EXISTS "Escrita admin" ON public.locations;
DROP POLICY IF EXISTS "Leitura lib para auth" ON public.objects;
DROP POLICY IF EXISTS "Escrita admin" ON public.objects;
DROP POLICY IF EXISTS "Leitura lib para auth" ON public.statuses;
DROP POLICY IF EXISTS "Escrita admin" ON public.statuses;
DROP POLICY IF EXISTS "Leitura lib para auth" ON public.handlers;
DROP POLICY IF EXISTS "Escrita admin" ON public.handlers;
DROP POLICY IF EXISTS "Leitura lib para auth" ON public.users;
DROP POLICY IF EXISTS "Escrita admin" ON public.users;

-- 4. Funções Autenticadoras do SQL
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  IF (SELECT email FROM auth.users WHERE id = auth.uid()) = 'cpdinfra@edu.itaguai.rj.gov.br' THEN
    RETURN true;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 5. CADASTRAR OFICIALMENTE AS POLÍTICAS RLS SEGURAS
-- USER PROFILES
CREATE POLICY "Perfis visiveis para autenticados" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios podem criar proprio perfil ou admin" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY "Usuarios atualizam proprio perfil ou admin" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Apenas admin pode deletar perfil" ON public.user_profiles FOR DELETE TO authenticated USING (public.is_admin());

-- PROCESSOS
CREATE POLICY "Leitura de processos para logados" ON public.processes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Adicao de processos apenas por operadores" ON public.processes FOR INSERT TO authenticated WITH CHECK (public.can_operate());
CREATE POLICY "Atualizacao de processos por operadores" ON public.processes FOR UPDATE TO authenticated USING (public.can_operate());
CREATE POLICY "Deletar processos apenas por admin" ON public.processes FOR DELETE TO authenticated USING (public.is_admin());

-- HISTÓRICO DE PROCESSOS
CREATE POLICY "Leitura historico para logados" ON public.process_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Adicao historico apenas operadores" ON public.process_history FOR INSERT TO authenticated WITH CHECK (public.can_operate());
CREATE POLICY "Atualizacao historico apenas operadores" ON public.process_history FOR UPDATE TO authenticated USING (public.can_operate());
CREATE POLICY "Deletar historico apenas por admin" ON public.process_history FOR DELETE TO authenticated USING (public.is_admin());

-- TABELAS AUXILIARES / CONFIGS
CREATE POLICY "Leitura lib para auth" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.suppliers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Leitura lib para auth" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.locations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Leitura lib para auth" ON public.objects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.objects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Leitura lib para auth" ON public.statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.statuses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Leitura lib para auth" ON public.handlers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.handlers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Leitura lib para auth" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Escrita admin" ON public.users FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
