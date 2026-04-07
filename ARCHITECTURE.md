# Arquitetura - SUB INFRA

## 🏗️ Visão Geral

SUB INFRA é uma **Progressive Web App (PWA)** monolítica com arquitetura baseada em:

```
┌─────────────────────────────────────────┐
│         Browser / PWA Container         │
├─────────────────────────────────────────┤
│  UI Layer (HTML + Vanilla JS)           │
│  ├── index.html (8K+ lines)             │
│  ├── Modal Components                   │
│  ├── Forms & Tables                     │
│  └── Responsive Design                  │
├─────────────────────────────────────────┤
│  Application Layer                      │
│  ├── 2026_script.js (Business Logic)    │
│  ├── config.js (Configuration)          │
│  ├── confirm-modal.js (Accessibility)   │
│  └── pwa-handler.js (PWA Lifecycle)     │
├─────────────────────────────────────────┤
│  Style & Component Layer                │
│  ├── ui-kit.css (Design Tokens)         │
│  ├── ui-kit.js (Component Utils)        │
│  └── Dark Mode Support                  │
├─────────────────────────────────────────┤
│  Data Layer                             │
│  ├── Supabase Client (supabase.js@2)    │
│  ├── Authentication (JWT)               │
│  └── Real-time Subscriptions            │
├─────────────────────────────────────────┤
│  Offline & Cache Layer                  │
│  ├── Service Worker (sw.js)             │
│  ├── Cache Strategies                   │
│  └── Manifest (manifest.json)           │
├─────────────────────────────────────────┤
│         External Services               │
│  ├── Supabase Backend                   │
│  ├── Chart.js (Visualizations)          │
│  ├── Font Awesome (Icons)               │
│  └── Google Fonts                       │
└─────────────────────────────────────────┘
```

---

## 📦 Componentes Principais

### 1. **index.html** - Aplicação Principal
- **Responsabilidade**: Estrutura HTML, modais e formulários
- **Tamanho**: 8,156 linhas
- **Contém**: 
  - Layout responsivo (desktop, tablet, mobile)
  - 15+ modais para diferentes operações
  - Tabelas de dados com filtros
  - Gráficos e estatísticas
  - Navegação móvel bottom-nav

### 2. **2026_script.js** - Lógica da Aplicação
- **Responsabilidade**: Business logic, API calls, state management
- **Tamanho**: 1,577 linhas
- **Funções principais**:
  - `openProcessModal()` - Abre modal de processo
  - `deleteProcess()` - Delete com confirmação
  - `loadUsers()` - Carrega usuários do Supabase
  - `updateUserInfo()` - Atualiza informações do usuário
  - Chart inicialização e atualização

### 3. **config.js** - Configuração Centralizada
- **Responsabilidade**: Gerenciar variáveis de ambiente e settings
- **Funções**:
  - `AppConfig.init()` - Inicializa configurações
  - `AppConfig.getSupabaseConfig()` - Retorna credenciais
  - `AppConfig.isDevelopment()` - Check de ambiente
  - Logging condicional baseado em modo

### 4. **confirm-modal.js** - Modal de Confirmação
- **Responsabilidade**: Substituir native `confirm()` com acessibilidade
- **Implementa**:
  - ARIA labels para screen readers
  - Keyboard navigation (ESC para fechar)
  - Promise-based API para async/await
  - Styling customizado (danger/normal)

### 5. **ui-kit.js & ui-kit.css** - Design System
- **ui-kit.css** (18.5 KB):
  - CSS custom properties (design tokens)
  - GOV.BR color palette
  - Componentes base (buttons, cards, tables)
  - Dark mode suporte
  - Animações e transitions
  
- **ui-kit.js** (11.6 KB):
  - Inicialização de componentes
  - Utilities (format currency, date)
  - Modal management
  - Acessibilidade helpers

### 6. **sw.js** - Service Worker
- **Responsabilidade**: Offline support, caching, PWA
- **Estratégias**:
  - Network First: HTML, API calls
  - Cache First: Static assets
  - Stale While Revalidate: Images
  - Network Only: Sensitive APIs

### 7. **pwa-handler.js** - Gerenciador PWA
- **Responsabilidade**: Instalação e updates da PWA
- **Features**:
  - Detecta disponibilidade de install
  - Prompts de instalação
  - Update checking
  - Background sync setup

---

## 🔄 Fluxos de Dados

### Fluxo de Login

```
1. User abre app → pwa-handler.js detecta novo SW
2. index.html carrega, service worker registra
3. User faz login via Supabase Auth
4. JWT token armazenado em sessionStorage
5. config.js carrega credenciais
6. 2026_script.js inicializa conexão Supabase
7. updateUserInfo() carrega perfil de user_profiles
8. Dashboard mostra dados baseado em permissões (RBAC)
```

### Fluxo de Criação de Processo

```
1. User clica "Novo Processo"
2. openProcessModal() abre modal (index.html)
3. Form preenchido com dados
4. User clica "Salvar"
5. ConfirmModal.show() pede confirmação
6. 2026_script.js chama supabase.insert()
7. showSuccessModal() mostra resultado
8. loadProcesses() recarrega tabela
9. Service Worker atualiza cache
```

### Fluxo de Sincronização Offline

```
1. App perde conexão
2. Service Worker ativa modo offline
3. Requests são enfileirados em localStorage
4. App mostra "Offline" no UI
5. Quando reconecta:
   - Requests enfileirados são enviados
   - Cache atualizado com novas respostas
   - UI sincroniza com backend
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

```sql
-- Processos de Pagamento
CREATE TABLE processes (
  id UUID PRIMARY KEY,
  nome VARCHAR NOT NULL,
  status VARCHAR,
  valor DECIMAL,
  created_at TIMESTAMP,
  created_by UUID REFERENCES user_profiles
);

-- Perfis de Usuário
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  nome VARCHAR,
  departamento VARCHAR,
  role VARCHAR ('admin', 'user', 'convidado'),
  ativo BOOLEAN DEFAULT true
);

-- Histórico de Ações
CREATE TABLE action_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles,
  action VARCHAR,
  table_name VARCHAR,
  record_id UUID,
  timestamp TIMESTAMP
);
```

### RLS (Row Level Security)

- **Processos**: Usuários veem apenas processos de seu departamento
- **Usuários**: Admins conseguem editar, users apenas leitura
- **Histórico**: Cada usuário vê apenas suas ações + admin vê todas

---

## 🔐 Segurança

### Camadas

1. **Frontend**
   - RBAC: `window.currentUserRole` verifica permissões
   - Menu oculto para non-admins (Settings, Backup, Logs)
   - Modal de confirmação para ações destrutivas

2. **API/Database**
   - Supabase Auth com JWT
   - RLS policies implementadas
   - Row-level access control

3. **Transport**
   - HTTPS only (Netlify enforces)
   - CORS configurado no Supabase

### Credenciais

- **VITE_SUPABASE_ANON_KEY**: Chave pública (segura em frontend)
- **VITE_SUPABASE_URL**: URL pública
- Ambas protegidas por RLS no banco

---

## ⚡ Performance

### Otimizações

1. **Caching**
   - Service Worker com múltiplas estratégias
   - Cache manifest com MD5 hashes
   - Auto cleanup de caches antigos

2. **Bundle Size**
   - Sem frameworks pesados (vanilla JS)
   - CSS custom properties (menor tamanho)
   - Chart.js lazy loaded

3. **Lazy Loading**
   - Modais abrem sob demanda
   - Gráficos renderizam quando visíveis
   - Imagens com lazy loading

### Métricas Atuais

| Métrica | Valor |
|---------|-------|
| index.html | 354 KB |
| 2026_script.js | 82 KB |
| ui-kit.css | 18.5 KB |
| ui-kit.js | 11.6 KB |
| Total (uncompressed) | ~900 KB |
| Depois de gzip | ~200 KB |

---

## 🚀 Build Pipeline

### Processo

```
1. npm run build
   ├─ build-script.js executa
   ├─ generate-cache-manifest.js calcula hashes
   ├─ Clean console.log com AppConfig wrapper
   ├─ Copia arquivos para dist/
   ├─ Copia ícones e assets
   └─ Service Worker atualizado

2. Netlify auto-deploy
   ├─ Detecta push em GitHub
   ├─ Roda: npm run build
   ├─ Publica dist/ via CDN
   └─ Cache invalidado automaticamente
```

### Artifacts Gerados

- `.cache-manifest.json` - MD5 hashes dos arquivos
- `.cache-version` - Versão para cache busting
- `dist/` - Build output pronto para produção

---

## 📱 Progressive Enhancement

### Níveis de Suporte

1. **PWA Full (Recomendado)**
   - Chrome 74+, Edge 79+, Safari 15+
   - Service Worker, Offline, Install

2. **Web App (Degradado)**
   - Firefox 55+, Safari 12+
   - Funciona mas sem offline

3. **Basic HTML (Fallback)**
   - Qualquer navegador com JS
   - Sem features avançadas

---

## 🧪 Testabilidade

### Estrutura para Testes

```javascript
// Em tools/testing/
- check_errors.js (Puppeteer integration tests)
- test_filter_dom.js (DOM testing com Playwright)
- Pode ser expandido para unit/e2e tests
```

### Como Adicionar Testes

```javascript
// Exemplo com Puppeteer
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('http://localhost:8000');

// Validar elementos
const title = await page.$eval('h1', el => el.textContent);
expect(title).toContain('SUB INFRA');
```

---

## 🔄 CI/CD

### GitHub + Netlify

```yaml
1. Developer faz push
2. GitHub Actions roda testes (se configurado)
3. Netlify recebe webhook
4. Roda: npm run build
5. Deploy automático para production
6. Cache invalidado globalmente
```

---

## 📊 Monitoramento

### O que Monitorar

- **Performance**: Lighthouse scores
- **Errors**: Console errors (AppConfig logs)
- **UX**: Click tracking, form completion
- **PWA**: Installation rates, offline usage

### Tools

- Netlify Analytics - Built-in
- Supabase Dashboard - Queries, Auth
- Browser DevTools - Network, Performance

---

## 🚀 Escalabilidade

### Limitações Atuais

- Monolítica (tudo em index.html)
- Sem estado compartilhado entre abas
- Sem background workers

### Planos Futuros

- Migrar para arquitetura modular
- Implementar Web Workers
- Separar componentes em módulos ES6
- Adicionar estado persistente com IndexedDB

---

## 📚 Referências

- [GOV.BR Design System](https://design-system.service.gov.br/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Checklist](https://web.dev/pwa-checklist/)
