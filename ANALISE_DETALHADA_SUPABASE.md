# ANÁLISE DETALHADA: INTEGRAÇÃO SUPABASE
## SUB INFRA PANEL v1.0.6

**Documento**: Análise profunda de Supabase - cliente, schema, RLS, auth  
**Data**: Março 2026  
**Foco**: SQL, configuração, segurança, padrões

---

## 1. INICIALIZAÇÃO DO CLIENTE SUPABASE

### 1.1 Configuração Global

```javascript
// 2026_script.js, linhas 1-50
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado global
window.state = {
  processes: [],
  suppliers: [],
  processTypes: [],
  locations: [],
  users: [],
  filterType: null,
  searchTerm: '',
  currentUser: null,
  userRole: null,
  chartData: null
};
```

**Segurança observada:**
- ✅ Chaves hardcoded em arquivo público (mitigado por RLS - veja seção 2)
- ✅ Anon key permite apenas leitura públicade dados com RLS
- ✅ URL exposta é aceitável (é propósito da chave anon)

**Como funciona a segurança com Anon Key:**
```
┌─────────────────────────────────────────────────────────────┐
│ Frontend com Anon Key exposta                               │
│                                                             │
│  supabase.from('processes').select('*')                    │
│       ↓                                                     │
│  Supabase API recebe requisição                            │
│       ↓                                                     │
│  Valida RLS Policy ANTES de retornar dados                 │
│       ↓                                                     │
│  Se usuario role = 'convidado' e policy bloqueia,          │
│  retorna vazio mesmo que tabela tenha dados                │
└─────────────────────────────────────────────────────────────┘
```

---

### 1.2 Listener de Autenticação

```javascript
// 2026_script.js, linhas 1351-1410
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event);
  
  if (event === 'SIGNED_IN' && session) {
    // Usuário fez login
    window.currentUser = session.user;
    window.userEmail = session.user.email;
    
    // Carregar perfil do usuário
    loadUserProfile(session.user.id);
    
  } else if (event === 'SIGNED_OUT') {
    // Usuário fez logout
    window.currentUser = null;
    window.userRole = null;
    window.state = { ...window.state, users: [] };
    redirectToLogin();
    
  } else if (event === 'USER_UPDATED') {
    // Email verificado ou MFA ativado
    console.log('Usuário atualizado');
  }
});
```

**Padrão:**
- Listener ativado na inicialização
- Gerencia transição entre estados autenticado/não autenticado
- Carrega perfil após login bem-sucedido

---

### 1.3 Carregamento de Dados com Autenticação

```javascript
// 2026_script.js, linhas 174-220
window.initApp = async function() {
  try {
    // Verificar se está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    // Carregar dados em paralelo
    const [
      processesResult,
      suppliersResult,
      typesResult,
      locationsResult,
      usersResult
    ] = await Promise.all([
      supabase.from('processes')
        .select('*, process_types(name), suppliers(name), locations(name)')
        .order('created_at', { ascending: false }),
      
      supabase.from('suppliers')
        .select('*')
        .order('name'),
      
      supabase.from('process_types')
        .select('*'),
      
      supabase.from('locations')
        .select('*'),
      
      supabase.from('user_profiles')
        .select('id, email, role')
        .eq('id', user.id)
    ]);
    
    // Verificar erros
    if (processesResult.error) throw processesResult.error;
    if (suppliersResult.error) throw suppliersResult.error;
    // ... etc
    
    // Atualizar estado
    window.state.processes = processesResult.data || [];
    window.state.suppliers = suppliersResult.data || [];
    window.state.processTypes = typesResult.data || [];
    window.state.locations = locationsResult.data || [];
    window.userRole = usersResult.data[0]?.role || 'convidado';
    
    // Renderizar
    window.renderUI();
    
  } catch (error) {
    console.error('Erro ao inicializar app:', error);
    alert('Erro ao carregar dados: ' + error.message);
  }
};
```

**Observações:**
- Promise.all() para paralelizar requisições
- Joins usando sintaxe `tabela(coluna1, coluna2)`
- Tratamento individual de erros por resultado
- Fallback para 'convidado' se não encontrar perfil

---

## 2. SCHEMA DO BANCO DE DADOS

### 2.1 Tabelas Principais

```sql
-- supabase_schema.sql, linhas 1-100

-- Tabela: processes (Processos)
CREATE TABLE processes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type_id BIGINT REFERENCES process_types(id),
  supplier_id BIGINT REFERENCES suppliers(id),
  location_id BIGINT REFERENCES locations(id),
  status VARCHAR(50) DEFAULT 'ativo',
  priority INT DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: suppliers (Fornecedores)
CREATE TABLE suppliers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  cnpj VARCHAR(18) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: process_types (Tipos de Processo)
CREATE TABLE process_types (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#808080',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: locations (Localizações)
CREATE TABLE locations (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(100),
  state VARCHAR(2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: user_profiles (Perfis de Usuário)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'convidado', -- administrador, operador, convidado
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: process_history (Histórico)
CREATE TABLE process_history (
  id BIGSERIAL PRIMARY KEY,
  process_id BIGINT REFERENCES processes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50), -- 'created', 'updated', 'deleted', 'viewed'
  old_data JSONB,
  new_data JSONB,
  changes_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: audit_logs (Auditoria)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  table_name VARCHAR(100),
  record_id BIGINT,
  action VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Relacionamentos:**
```
processes (1) ──→ (1) process_types
         (1) ──→ (1) suppliers
         (1) ──→ (1) locations
         (1) ──→ (1) user_profiles (created_by)
         (1) ──→ (1) user_profiles (updated_by)

process_history (many) ──→ (1) processes
                (many) ──→ (1) user_profiles

audit_logs (many) ──→ (1) user_profiles
```

---

### 2.2 Funções SQL para RBAC

```sql
-- supabase_schema.sql, linhas 127-160

-- Função: is_admin()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM user_profiles
  WHERE id = v_user_id;
  
  RETURN v_role = 'administrador';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: can_operate()
CREATE OR REPLACE FUNCTION can_operate()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM user_profiles
  WHERE id = v_user_id;
  
  RETURN v_role IN ('administrador', 'operador');
END;
$$ LANGUAGE plpgsql
