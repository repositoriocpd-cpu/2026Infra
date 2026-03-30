# ✅ CHECKLIST DE IMPLEMENTAÇÃO - GUIA PRÁTICO
## SUB INFRA PANEL v1.0.6 - Plano de Ação Executável

**Data**: 30 de Março de 2026  
**Versão**: 1.0  
**Status**: Pronto para implementação

---

## 🚨 AÇÕES CRÍTICAS - FAZER HOJE

### 1. Corrigir Bug RBAC (1 hora)

**Arquivo**: `2026_script.js`  
**Localização**: Função `updateUserInfo()` (~linha 1340)

**Checklist:**
- [ ] Abrir `2026_script.js`
- [ ] Encontrar `window.updateUserInfo = function() {`
- [ ] Adicionar código para esconder todos menus:
```javascript
// Primeiro, esconder todos
document.getElementById('adminMenu').style.display = 'none';
document.getElementById('operadorMenu').style.display = 'none';
document.getElementById('convidadoMenu').style.display = 'none';
```
- [ ] Depois mostrar apenas o correto baseado em `window.userRole`
- [ ] Adicionar `else` para caso de role desconhecida
- [ ] Testar com 3 roles diferentes
- [ ] Fazer commit: `"fix: RBAC vulnerability - hide menus correctly"`

**Verificação:**
```javascript
// Teste no console
window.userRole = 'convidado';
window.updateUserInfo();
// Verificar: adminMenu deve estar hidden
```

---

### 2. Corrigir Super-Admin Hardcoded (3 horas)

**Arquivo**: `supabase_schema.sql`  
**Localização**: Função `is_super_admin()` (~linha 157)

**Checklist:**

#### Passo 1: Criar Tabela no Supabase
- [ ] Acessar https://app.supabase.com/project/[seu-project]/sql/new
- [ ] Copiar e executar SQL:

```sql
-- Criar tabela super_admins
CREATE TABLE super_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  added_at TIMESTAMP DEFAULT now(),
  added_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Política: Apenas o próprio usuário ou admin pode ver
CREATE POLICY "super_admin_view" ON super_admins
FOR SELECT USING (
  id = auth.uid() OR 
  EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid())
);

-- Inserir super admin conhecido
INSERT INTO super_admins (id, email)
SELECT id, email FROM auth.users 
WHERE email = 'cpdinfra@edu.itaguai.rj.gov.br';
```

#### Passo 2: Atualizar Função SQL
- [ ] Na mesma interface SQL, executar:

```sql
-- Atualizar função is_super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Passo 3: Testar
- [ ] Fazer login com super admin
- [ ] Verificar permissões no dashboard
- [ ] Fazer login com operador
- [ ] Verificar que não é admin

- [ ] Fazer commit: `"fix: move super-admin to database table"`

---

### 3. Implementar Backend Proxy (3-4 horas)

**Objetivo**: Esconder credenciais do Supabase

**Checklist:**

#### Opção A: Node.js + Express (Recomendado)

- [ ] Criar pasta `backend/`:
```bash
mkdir backend
cd backend
npm init -y
npm install express dotenv @supabase/supabase-js express-rate-limit
```

- [ ] Criar arquivo `backend/server.js`:

```javascript
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições, tente novamente mais tarde'
});

// Supabase (servidor)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware de autenticação
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Sem token' });
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Rotas
app.get('/api/processes', limiter, verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('processes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar processos' });
  }
});

app.post('/api/processes', limiter, verifyAuth, async (req, res) => {
  try {
    const { name, type_id, location_id } = req.body;
    
    // Validar
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    
    const { data, error } = await supabase
      .from('processes')
      .insert([{
        name,
        type_id,
        location_id,
        created_by: req.user.id
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar processo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em porta ${PORT}`);
});
```

- [ ] Criar `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (pegar no Supabase)
FRONTEND_URL=http://localhost:3000
PORT=3001
```

- [ ] Deploy (recomendado Render ou Railway):
  - [ ] Clonar repositório no Render.com
  - [ ] Adicionar variáveis de ambiente
  - [ ] Deploy automático

#### Passo 2: Atualizar Frontend
- [ ] Abrir `2026_script.js`
- [ ] Localizar `window.fetchProcesses()`
- [ ] Trocar Supabase direto por fetch:

```javascript
window.fetchProcesses = async function() {
  try {
    window.state.isLoading = true;
    
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const response = await fetch('/api/processes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Erro na requisição');
    
    const data = await response.json();
    window.state.processes = data;
    window.renderProcessTable();
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar dados');
  } finally {
    window.state.isLoading = false;
  }
};
```

- [ ] Testar em desenvolvimento
- [ ] Fazer commit: `"feat: add backend proxy for API security"`

---

## 📋 SEMANA 1 - TESTES AUTOMATIZADOS

### Setup Inicial (2 horas)

- [ ] Instalar dependências:
```bash
npm install --save-dev jest @testing-library/dom @testing-library/jest-dom
```

- [ ] Criar `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['2026_script.js']
};
```

- [ ] Criar `jest.setup.js`:
```javascript
require('@testing-library/jest-dom');
```

### Testes de Segurança (4 horas)

- [ ] Criar `__tests__/security.test.js`:

```javascript
describe('Segurança', () => {
  describe('RBAC', () => {
    test('convidado não vê menu admin', () => {
      window.userRole = 'convidado';
      window.updateUserInfo();
      
      const adminMenu = document.getElementById('adminMenu');
      expect(adminMenu.style.display).toBe('none');
    });
    
    test('administrador vê menu admin', () => {
      window.userRole = 'administrador';
      window.updateUserInfo();
      
      const adminMenu = document.getElementById('adminMenu');
      expect(adminMenu.style.display).toBe('block');
    });
  });
  
  describe('Validação', () => {
    test('email inválido é rejeitado', () => {
      expect(window.validateEmail('invalid')).toBe(false);
      expect(window.validateEmail('user@example.com')).toBe(true);
    });
  });
});
```

- [ ] Executar testes:
```bash
npm test
```

- [ ] Adicionar mais testes conforme necessário

---

## 🏗️ SEMANA 2-3 - MODULARIZAÇÃO

### Estrutura de Pastas (1 hora)

- [ ] Criar nova estrutura:
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.js
│   │   ├── auth.html
│   │   └── auth.test.js
│   ├── processes/
│   │   ├── processes.js
│   │   ├── processes.html
│   │   └── processes.test.js
│   ├── dashboard/
│   │   └── dashboard.js
│   └── utils/
│       ├── validation.js
│       ├── formatting.js
│       └── api.js
├── components/
│   ├── modal.js
│   ├── table.js
│   └── button.js
└── main.js (entry point)
```

### Criar Componentes Reutilizáveis (8 horas)

- [ ] Criar `src/components/modal.js`:

```javascript
export class Modal {
  constructor(id, options = {}) {
    this.id = id;
    this.element = document.getElementById(id);
    this.options = {
      closeOnEscape: true,
      closeOnClickOutside: true,
      ...options
    };
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) this.close();
      });
    }
    
    if (this.options.closeOnClickOutside) {
      this.element?.addEventListener('click', (e) => {
        if (e.target === this.element) this.close();
      });
    }
  }
  
  open() {
    this.element.style.display = 'flex';
    this.element.classList.add('modal-open');
  }
  
  close() {
    this.element.style.display = 'none';
    this.element.classList.remove('modal-open');
  }
  
  isOpen() {
    return this.element.classList.contains('modal-open');
  }
}
```

- [ ] Criar `src/components/table.js`:

```javascript
export class DataTable {
  constructor(tableSelector, options = {}) {
    this.table = document.querySelector(tableSelector);
    this.options = {
      sortable: true,
      filterable: true,
      ...options
    };
    this.data = [];
  }
  
  setData(data) {
    this.data = data;
    this.render();
  }
  
  render() {
    const tbody = this.table.querySelector('tbody');
    tbody.innerHTML = '';
    
    this.data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = Object.values(row)
        .map(cell => `<td>${this.escapeHtml(cell)}</td>`)
        .join('');
      tbody.appendChild(tr);
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
```

---

## 📊 SEMANA 4 - DOCUMENTAÇÃO

- [ ] Criar `ARCHITECTURE.md` (descrevendo nova estrutura)
- [ ] Criar `COMPONENTS.md` (guia de componentes)
- [ ] Criar `API.md` (endpoints disponíveis)
- [ ] Atualizar `README.md`

---

## 🎯 SEMANA 5-8 - FASE 3: NOVAS FUNCIONALIDADES

### Dashboard Avançado

- [ ] Adicionar biblioteca Chart.js:
```bash
npm install chart.js
```

- [ ] Criar widget de gráfico:
```javascript
export class ChartWidget {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.chart = null;
    this.options = options;
  }
  
  setData(labels, data) {
    if (this.chart) this.chart.destroy();
    
    this.chart = new Chart(this.canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Tendência',
          data,
          fill: false,
          borderColor: '#3B82F6'
        }]
      }
    });
  }
}
```

### Notificações em Tempo Real

- [ ] Usar Supabase Realtime:
```javascript
supabase
  .channel('processes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'processes' },
    (payload) => {
      console.log('Mudança:', payload);
      // Atualizar UI
      window.fetchProcesses();
    }
  )
  .subscribe();
```

### Busca Global

- [ ] Adicionar filtro full-text:
```javascript
window.searchProcesses = async function(query) {
  const { data } = await supabase
    .from('processes')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  
  return data;
};
```

---

## 🔍 VERIFICAÇÃO FINAL

### Antes de Fazer Deploy

- [ ] RBAC testado com todos os roles ✅
- [ ] Backend proxy funcionando ✅
- [ ] Super-admin em tabela (não hardcoded) ✅
- [ ] Testes passando (coverage >80%) ✅
- [ ] Sem vulnerabilidades críticas ✅
- [ ] Lighthouse score >90 ✅
- [ ] Performance Web Vitals OK ✅

### Testes de Segurança

```bash
# Verificar exposição de credenciais
grep -r "SUPABASE_ANON_KEY" src/
grep -r "hardcoded" src/

# Executar testes
npm test

# Build
npm run build

# Lighthouse
lighthouse http://localhost:3000
```

---

## 📝 TEMPLATE DE COMMIT

```bash
# Commits devem seguir este formato

# Fix crítico
git commit -m "fix: RBAC vulnerability - hide menus correctly"

# Feature
git commit -m "feat: add backend proxy for API requests"

# Refactor
git commit -m "refactor: modularize 2026_script.js"

# Docs
git commit -m "docs: update architecture guide"

# Test
git commit -m "test: add security tests for RBAC"
```

---

## 📞 SUPORTE

### Dúvidas sobre implementação?
- Consultar `EXPLORACAO_DETALHADA_ESPECIFICA.md`
- Verificar `ANALISE_DETALHADA_*.md` relevante

### Problemas de segurança?
- Referência rápida: `COMECE_AQUI.md` → Seção "SEGURANÇA"
- Análise completa: `ANALISE_DETALHADA_SEGURANCA.md`

---

## 📈 TRACKING DE PROGRESSO

| Task | Status | ETA | Responsável |
|------|--------|-----|-------------|
| Fix RBAC | ⏳ Pendente | 30/03 | [ ] |
| Fix Super-admin | ⏳ Pendente | 30/03 | [ ] |
| Backend Proxy | ⏳ Pendente | 01/04 | [ ] |
| Testes Setup | ⏳ Pendente | 05/04 | [ ] |
| Testes Security | ⏳ Pendente | 08/04 | [ ] |
| Modularização | ⏳ Pendente | 15/04 | [ ] |
| Documentação | ⏳ Pendente | 20/04 | [ ] |

---

**Checklist Versão**: 1.0  
**Última atualização**: 30/03/2026  
**Próxima revisão**: 15/04/2026

