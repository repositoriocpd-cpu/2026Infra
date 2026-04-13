# Relatório Completo do Banco de Dados - SUB INFRA

## Visão Geral do Sistema

| Componente | Descrição |
|------------|-----------|
| **Banco** | PostgreSQL (Supabase) |
| **URL** | `sxsfqvcxikdsahhidrdx.supabase.co` |
| **Schema** | `public` |
| **Autenticação** | Supabase Auth + RLS (Row Level Security) |

---

## 1. Tabelas do Sistema

### 1.1 Tabela: `user_profiles` (Perfis de Usuário)

```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    department TEXT,
    role TEXT CHECK (role IN ('administrador', 'operador', 'convidado')) DEFAULT 'convidado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

| Coluna | Tipo |Nullable | Padrão | Descrição |
|--------|------|---------|--------|-----------|
| `id` | uuid | NOT NULL | - | FK para auth.users (PK do usuário autenticado) |
| `full_name` | text | NULL | - | Nome completo do usuário |
| `department` | text | NULL | - | Secretaria/departamento |
| `role` | text | NULL | 'convidado' | Perfil: administrador, operador ou convidado |
| `created_at` | timestamptz | NOT NULL | now() | Data de criação |

### 1.2 Tabela: `processes` (Processos de Pagamento)

```sql
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
```

| Coluna | Tipo |Nullable | Descrição |
|--------|------|---------|-----------|
| `id` | uuid | NOT NULL | PK única do processo |
| `pp_number` | text | NULL | Número do PP |
| `exercise_year` | text | NULL | Ano do exercício |
| `pp_ano` | text | NOT NULL | Ano do PP (obrigatório) |
| `cover_value` | text | NULL | Valor de cobertura |
| `supplier_name` | text | NULL | Nome do fornecedor |
| `object_name` | text | NULL | Objeto (compra/serviço) |
| `opening_date` | date | NULL | Data de abertura |
| `deadline` | date | NULL | Prazo |
| `treated_by` | text | NULL | Tratador/responsável |
| `status` | text | NULL | Status atual |
| `location` | text | NULL | Localização atual |
| `location_date` | date | NULL | Data da localização |
| `situation` | text | NULL | Situação |
| `notes` | text | NULL | Observações |
| `created_at` | timestamptz | NOT NULL | Data criação |
| `updated_at` | timestamptz | NOT NULL | Data atualização |

### 1.3 Tabela: `process_history` (Histórico de Tramitações)

```sql
CREATE TABLE public.process_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
    history_date TEXT NOT NULL,
    location_from TEXT,
    location_to TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

| Coluna | Tipo |Nullable | Descrição |
|--------|------|---------|-----------|
| `id` | uuid | NOT NULL | PK do registro |
| `process_id` | uuid | NOT NULL | FK para processes |
| `history_date` | text | NOT NULL | Data do registro |
| `location_from` | text | NULL | De onde veio |
| `location_to` | text | NULL | Para onde foi |
| `message` | text | NULL | Mensagem/observação |
| `created_at` | timestamptz | NOT NULL | Data criação |

---

### 1.4 Tabelas de Configuração (Listas)

#### Tabela: `suppliers` (Fornecedores)
```sql
CREATE TABLE public.suppliers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabela: `locations` (Locais/Secretarias)
```sql
CREATE TABLE public.locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabela: `objects` (Objetos)
```sql
CREATE TABLE public.objects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabela: `statuses` (Statuses)
```sql
CREATE TABLE public.statuses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabela: `handlers` (Handlers/Responsáveis)
```sql
CREATE TABLE public.handlers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Tabela: `users` (Usuários do Fluxo)
```sql
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 2. Perfis de Usuário e Permissões

### 2.1 Roles Definidos

| Role | Descrição | Privilegies |
|------|-----------|-------------|
| `administrador` | Administrador do sistema | CRUD completo em todas tabelas |
| `operador` | Operador/Usuário comum | Criar, editar, excluir processos e histórico |
| `convidado` | Apenas visualização | Apenas leitura (read-only) |

### 2.2 Matriz de Permissões por Perfil

#### Tabela: `processes`

| Operação | Administrador | Operador | Convidado |
|----------|---------------|----------|-----------|
| SELECT (ler) | ✓ | ✓ | ✓ |
| INSERT (criar) | ✓ | ✓ | ✗ |
| UPDATE (editar) | ✓ | ✓ | ✗ |
| DELETE (excluir) | ✓ | ✗ | ✗ |

#### Tabela: `process_history`

| Operação | Administrador | Operador | Convidado |
|----------|---------------|----------|-----------|
| SELECT (ler) | ✓ | ✓ | ✓ |
| INSERT (criar) | ✓ | ✓ | ✗ |
| UPDATE (editar) | ✓ | ✓ | ✗ |
| DELETE (excluir) | ✓ | ✗ | ✗ |

#### Tabela: `user_profiles`

| Operação | Administrador | Operador | Convidado |
|----------|---------------|----------|-----------|
| SELECT (ler) | ✓ | ✓ | ✓ |
| INSERT (criar) | ✓ (próprio ou outros) | ✓ (próprio) | ✗ |
| UPDATE (editar) | ✓ (próprio ou outros) | ✓ (próprio) | ✗ |
| DELETE (excluir) | ✓ | ✗ | ✗ |

#### Tabelas de Configuração (`suppliers`, `locations`, `objects`, `statuses`, `handlers`, `users`)

| Operação | Administrador | Operador | Convidado |
|----------|---------------|----------|-----------|
| SELECT (ler) | ✓ | ✓ | ✓ |
| INSERT/UPDATE/DELETE | ✓ | ✗ | ✗ |

---

## 3. Funções Auxiliares (Stored Functions)

### 3.1 `is_admin()` - Verifica se usuário é administrador

```sql
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
```

**Retorna:** `true` se usuário for administrador ou email especial.

### 3.2 `can_operate()` - Verifica se usuário pode operar

```sql
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
```

**Retorna:** `true` se usuário for operador ou administrador.

### 3.3 `edit_process_history()` - Editar histórico

```sql
CREATE OR REPLACE FUNCTION public.edit_process_history(
  p_history_id UUID,
  p_new_message TEXT
)
RETURNS JSON AS $$
BEGIN
  IF NOT public.can_operate() THEN
    RETURN json_build_object('error', 'Sem permissão para editar');
  END IF;
  
  UPDATE public.process_history
  SET message = p_new_message
  WHERE id = p_history_id;
  
  RETURN json_build_object('success', true, 'message', 'Registro atualizado com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.4 `delete_process_history()` - Deletar histórico

```sql
CREATE OR REPLACE FUNCTION public.delete_process_history(
  p_history_id UUID
)
RETURNS JSON AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Sem permissão para deletar');
  END IF;
  
  DELETE FROM public.process_history
  WHERE id = p_history_id;
  
  RETURN json_build_object('success', true, 'message', 'Registro excluído com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Políticas de Segurança (RLS)

### 4.1 user_profiles

| Política | Operação | Condição |
|----------|----------|----------|
| `Perfis visiveis para autenticados` | SELECT | Usuários logados podem ver todos |
| `Usuarios podem criar proprio perfil ou admin` | INSERT | Próprio usuário ou admin |
| `Usuarios atualizam proprio perfil ou admin` | UPDATE | Próprio usuário ou admin |
| `Apenas admin pode deletar perfil` | DELETE | Apenas admin |

### 4.2 processes

| Política | Operação | Condição |
|----------|----------|----------|
| `Leitura de processos para logados` | SELECT | Usuários logados |
| `Adicao de processos apenas por operadores` | INSERT | operador ou admin |
| `Atualizacao de processos por operadores` | UPDATE | operador ou admin |
| `Deletar processos apenas por admin` | DELETE | Apenas admin |

### 4.3 process_history

| Política | Operação | Condição |
|----------|----------|----------|
| `Leitura historico para logados` | SELECT | Usuários logados |
| `Adicao historico apenas operadores` | INSERT | operador ou admin |
| `Atualizacao historico apenas operadores` | UPDATE | operador ou admin |
| `Deletar historico apenas por admin` | DELETE | Apenas admin |

### 4.4 Tabelas de Configuração (suppliers, locations, objects, statuses, handlers, users)

| Política | Operação | Condição |
|----------|----------|----------|
| `Leitura lib para auth` | SELECT | Usuários logados |
| `Escrita admin` | ALL | Apenas admin |

---

## 5. Dados Iniciais (Seed Data)

### 5.1 Locations (Locais)
```sql
INSERT INTO public.locations (name) VALUES 
('Secretaria'), ('Gabinete'), ('Finanças'), ('Protocolo'), 
('Compras'), ('Almoxarifado'), ('Tesouraria'), ('Nutrição');
```

### 5.2 Objects (Objetos)
```sql
INSERT INTO public.objects (name) VALUES 
('Compra de Material'), ('Prestação de Serviço');
```

### 5.3 Statuses
```sql
INSERT INTO public.statuses (name) VALUES 
('Em Análise'), ('Aguardando Assinatura'), ('Concluído'), ('Pendente');
```

### 5.4 Handlers (Responsáveis)
```sql
INSERT INTO public.handlers (name) VALUES 
('Gabinete'), ('Infraestrutura'), ('Administrativo');
```

### 5.5 Users (Usuários do Fluxo)
```sql
INSERT INTO public.users (name) VALUES 
('Admin'), ('Operador');
```

### 5.6 Suppliers (Fornecedores) - 31 fornecedores
```sql
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
('WILSON MASSALINO DE FREITAS');
```

---

## 6. Fluxo de Dados entre Páginas e Tabelas

### 6.1 Página: Dashboard (index.html)

| Dado | Tabela Origem | Operación |
|------|-------------|-----------|
| Total de processos | `processes` | SELECT COUNT |
| Processos por status | `processes` | SELECT GROUP BY status |
| Processos por localização | `processes` | SELECT GROUP BY location |
| Processo recente | `processes` | SELECT ORDER BY created_at DESC |

### 6.2 Página: Lista de Processos

| Dado | Tabela Origem | Operación |
|------|-------------|-----------|
| Lista processos | `processes` | SELECT |
| Histórico do processo | `process_history` | SELECT WHERE process_id = ? |
| Fornecedores | `suppliers` | SELECT |
| Locais | `locations` | SELECT |
| Objects | `objects` | SELECT |
| Statuses | `statuses` | SELECT |
| Handlers | `handlers` | SELECT |

### 6.3 Página: Perfil do Usuário

| Dado | Tabela Origem | Operación |
|------|-------------|-----------|
| Dados do perfil | `user_profiles` | SELECT WHERE id = auth.uid() |
| Atualizar perfil | `user_profiles` | UPDATE |

### 6.4 Página: Configurações (Admin)

| Dado | Tabela Origem | Operación |
|------|-------------|-----------|
| Lista fornecedores | `suppliers` | SELECT/INSERT/UPDATE/DELETE |
| Lista locais | `locations` | SELECT/INSERT/UPDATE/DELETE |
| Lista objetos | `objects` | SELECT/INSERT/UPDATE/DELETE |
| Lista status | `statuses` | SELECT/INSERT/UPDATE/DELETE |
| Lista handlers | `handlers` | SELECT/INSERT/UPDATE/DELETE |
| Lista usuários | `users` | SELECT/INSERT/UPDATE/DELETE |

---

## 7. Usuários Especiais (Bypass)

| Email | Tipo | Acesso |
|-------|------|--------|
| `cpdinfra@edu.itaguai.rj.gov.br` | Admin automático | Acesso total (bypass RLS) |

Este usuário tem acesso automático a todas as operações, ignorando as políticas RLS.

---

## 8. Resumo de Relacionamentos

```
auth.users (Sistema Supabase)
    │
    └──► user_profiles (1:1)
              │
              └── role ──► permisos em:
                          │
                          ├── processes (CRUD conforme role)
                          ├── process_history (CRUD conforme role)
                          └── tabelas config (apenas admin)
```

---

## 9. Consulta Rápida de Permissões

### Verificar perfil do usuário atual:
```sql
SELECT * FROM public.user_profiles 
WHERE id = auth.uid();
```

### Verificar se é admin:
```sql
SELECT public.is_admin();
```

### Verificar se pode operar:
```sql
SELECT public.can_operate();
```

### Listar todos os usuários:
```sql
SELECT up.*, au.email 
FROM public.user_profiles up 
JOIN auth.users au ON up.id = au.id;
```

---

*Documento gerado em: 10/04/2026*
*Sistema: SUB INFRA - Gestão de Processos de Pagamento*