# Guia de Setup - SUB INFRA

## Sobre o Projeto

SUB INFRA é um **Progressive Web App (PWA)** para gestão de processos de pagamento e infraestrutura, desenvolvido pela **SMEDU** (Secretaria Municipal de Educação de Itaguaí).

- **Versão**: 1.0.6
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript (ES6+), Supabase
- **Deploy**: Netlify
- **Pattern Design**: GOV.BR

---

## 📋 Pré-requisitos

- **Node.js** 14+ e **npm**
- **Git** para controle de versão
- Navegador moderno com suporte a PWA e Service Workers

---

## 🚀 Instalação Local

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-repo/sub-infra.git
cd sub-infra
```

### 2. Instale Dependências

```bash
npm install
```

### 3. Configuração de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com suas credenciais:

```bash
# Copie do arquivo de exemplo
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://sxsfqvcxikdsahhidrdx.supabase.co
VITE_SUPABASE_ANON_KEY=seu_token_jwt_aqui

# Application Settings
VITE_APP_VERSION=1.0.6
VITE_APP_ENV=development

# Debug Logging
VITE_DEBUG_LOGS=true
```

⚠️ **Importante**: Nunca faça commit do `.env.local` - ele está no `.gitignore`

### 4. Execute o Servidor de Desenvolvimento

```bash
# Usando Live Server (recomendado)
npx live-server .

# Ou abra index.html diretamente no navegador
# Abra: file://seu-caminho/index.html
```

---

## 🔨 Build para Produção

### Build Otimizado

```bash
npm run build
```

Isso vai gerar a pasta `dist/` com todos os arquivos otimizados.

**Arquivos gerados:**
- `index.html` - Aplicação principal
- `2026_script.js` - Lógica da aplicação
- `config.js` - Configuração centralizada
- `confirm-modal.js` - Componente de confirmação
- `ui-kit.js` e `ui-kit.css` - Design system
- `sw.js` - Service Worker para PWA
- `pwa-handler.js` - Gerenciador de PWA

---

## 📁 Estrutura do Projeto

```
sub-infra/
├── index.html                 # Aplicação principal (8K linhas)
├── 2026_script.js            # Scripts principais
├── config.js                 # Configuração centralizada
├── confirm-modal.js          # Modal acessível
├── pwa-handler.js            # Gerenciador PWA
├── ui-kit.js                 # Componentes UI
├── ui-kit.css                # Design system
├── sw.js                     # Service Worker
├── build-script.js           # Script de build customizado
├── generate-cache-manifest.js # Gerador de cache manifest
├── .env.example              # Template de variáveis de ambiente
├── .env.local                # Variáveis de ambiente (git ignored)
├── .gitignore                # Configuração Git
├── package.json              # Dependências
├── manifest.json             # Manifesto PWA
├── dist/                     # Build output (git ignored)
├── public/                   # Arquivos públicos
├── icons/                    # Ícones PWA
├── tools/
│   └── testing/              # Utilitários de desenvolvimento
└── README.md                 # Documentação principal
```

---

## 🔐 Variáveis de Ambiente

### Disponíveis

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_SUPABASE_URL` | URL do Supabase | - |
| `VITE_SUPABASE_ANON_KEY` | Chave JWT do Supabase | - |
| `VITE_APP_VERSION` | Versão da app | 1.0.6 |
| `VITE_APP_ENV` | Ambiente (development/production) | production |
| `VITE_DEBUG_LOGS` | Habilitar logs de debug | false |

### Acessando no Código

```javascript
// Via AppConfig global
if (AppConfig.isDevelopment()) {
  console.log('Em desenvolvimento!');
}

// Verificar valores
console.log(AppConfig.supabase.url);
```

---

## 🛠️ Ferramentas de Desenvolvimento

### Scripts Disponíveis

```bash
# Build para produção
npm run build

# Limpar console.log de produção (já feito automaticamente)
node clean-console.js

# Gerar manifesto de cache
node generate-cache-manifest.js
```

### Ferramentas de Teste

Na pasta `tools/testing/` existem utilitários para desenvolvimento:

- `check_errors.js` - Verificação de erros com Puppeteer
- `test_filter_dom.js` - Testes DOM com Playwright
- Scripts Python para análise

---

## 🌐 Deploy no Netlify

### Configuração Automática

O projeto já tem `netlify.toml` configurado. Basta fazer push:

```bash
git push origin seu-branch
```

### Variáveis de Ambiente no Netlify

1. Vá para **Netlify Dashboard** → Seu Site → **Settings** → **Build & Deploy**
2. Clique em **Environment**
3. Adicione as mesmas variáveis do `.env.local`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_APP_ENV=production
VITE_DEBUG_LOGS=false
```

---

## 📱 PWA (Progressive Web App)

O projeto é um PWA completo com:

- **Instalável** - Pode ser instalado em dispositivos (desktop/mobile)
- **Offline** - Funciona sem internet graças ao Service Worker
- **Responsivo** - Funciona em qualquer tamanho de tela
- **Rápido** - Cache inteligente com múltiplas estratégias

### Instalar a PWA

1. **Desktop**: Clique no ícone no endereço (Chrome/Edge)
2. **Mobile**: Toque "Adicionar à tela inicial" (Safari/Chrome)

### Cache Strategies

O Service Worker usa estratégias diferentes:

| Tipo | Estratégia | Uso |
|------|-----------|-----|
| `networkFirst` | Rede primeiro, cache fallback | HTML, API calls |
| `cacheFirst` | Cache primeiro | Assets estáticos |
| `staleWhileRevalidate` | Retorna cache rápido, atualiza background | Imagens |
| `networkOnly` | Sempre rede | APIs sensíveis |

---

## 🔍 Debugging

### Console Condicional

Logs estão desabilitados em produção. Para habilitar debug:

```javascript
// Em development (automático)
AppConfig.debug.enableConsole = true;

// Ou verificar modo
if (AppConfig.isDevelopment()) {
  console.log('Debug habilitado');
}
```

### Storage

A aplicação usa:

- **localStorage** - Preferências de usuário (dark mode, etc)
- **sessionStorage** - Dados temporários da sessão
- **IndexedDB** - Dados persistentes (via Supabase cache)

---

## 🔐 Segurança

### Pontos Importantes

1. **Chaves do Supabase**
   - Chave pública (anon key) segura em frontend
   - Protegida por RLS (Row Level Security) no banco
   - Nunca fazer commit em .env.local

2. **Autenticação**
   - Supabase Auth via JWT
   - RBAC (Role-Based Access Control) implementado
   - Sessão por email

3. **Modal de Confirmação**
   - Substitui native `confirm()` 
   - Acessível com ARIA labels
   - Teclado navegável

---

## 🚨 Troubleshooting

### Build Falha

```bash
# Limpar cache
rm -rf dist node_modules
npm install
npm run build
```

### Service Worker Não Atualiza

```javascript
// Limpar cache do SW
if (navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
}
```

### Supabase Connection Error

1. Verifique `.env.local` tem as chaves corretas
2. Verifique IP está na whitelist do Supabase
3. Verifique RLS policies (settings → auth → Row Level Security)

### Componentes UI Não Aparecem

1. Verifique se `ui-kit.css` é carregado (DevTools → Network)
2. Verifique se `config.js` é carregado antes de `confirm-modal.js`
3. Limpe cache do navegador (Ctrl+Shift+Delete)

---

## 📚 Documentação Relacionada

- [GOV.BR Design System](https://design-system.service.gov.br/)
- [Supabase Docs](https://supabase.com/docs)
- [MDN - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

## 👥 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Faça commit: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/sua-feature`
4. Abra Pull Request

### Padrão de Commits

```
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração de código
docs: documentação
chore: manutenção
test: testes
```

---

## 📞 Suporte

Para problemas, abra uma issue em:
https://github.com/seu-repo/sub-infra/issues

---

## 📄 Licença

Desenvolvido para SMEDU - Secretaria Municipal de Educação de Itaguaí
