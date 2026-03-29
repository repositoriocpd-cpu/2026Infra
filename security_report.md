# 🔒 Relatório de Auditoria de Segurança — Sistema SUB INFRA

**Data:** 28/03/2026
**Servidor testado:** `http://127.0.0.1:8080`
**Arquivo principal:** [index.html](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/index.html)

---

## Resumo Executivo

| Categoria | Nível | Resultado |
|-----------|-------|-----------|
| 🔐 Login com credenciais inválidas | Médio | ⚠️ **Não testado** (bot bloqueado pelo `confirm()`) |
| 🛡️ RBAC — Acesso de Convidado | **CRÍTICO** | ❌ **FALHA** |
| 🔑 Exposição de API Keys | **ALTO** | ⚠️ **ATENÇÃO** |
| 🚫 Acesso sem login (overlay) | Baixo | ✅ **PASS** |
| ✅ Validação de entrada | Médio | ⚠️ **Parcial** |

---

## 🚨 Vulnerabilidade Crítica: RBAC Quebrado para "CONVIDADO"

> [!CAUTION]
> Quando o perfil do usuário não é encontrado na tabela `user_profiles`, o sistema permite acesso **irrestrito** a TODOS os módulos administrativos, incluindo "Configurações", "Cadastro de Usuários", "Backup e Restauração", etc.

### Evidência Visual

O screenshot abaixo mostra que um usuário com perfil "CONVIDADO" (sem role definido) tem acesso total ao menu "Configurações" e todos os seus submódulos:

![Convidado com acesso irrestrito às Configurações](file:///C:/Users/Usu%C3%A1rio/.gemini/antigravity/brain/c613f525-2c49-4e85-af6a-3fa3608a09f5/.system_generated/click_feedback/click_feedback_1774703809121.png)

### Causa Raiz

No arquivo [index.html L7260-7274](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/index.html#L7260-L7274):

```javascript
if (profile) {
    // ✅ Caso tenha perfil → esconde menu se não for admin
    menuSettings.style.display = profile.role === 'administrador' ? 'block' : 'none';
} else {
    // ❌ BUG: Caso NÃO tenha perfil → menu NÃO é escondido
    userEl.innerText = user.email.split('@')[0];
    deptEl.innerText = 'CONVIDADO';
    // ⚠️ menuSettings.style.display NÃO é alterado → permanece visível!
}
```

O bloco `else` (quando `profile === null`) **não esconde** o menu "Configurações". Isso significa que qualquer usuário autenticado no Supabase cujo perfil não exista na tabela `user_profiles` terá acesso de administrador.

### Correção Recomendada

```diff
 } else {
     userEl.innerText = user.email.split('@')[0];
     deptEl.innerText = 'CONVIDADO';
+    window.currentUserRole = 'convidado';
+    if (menuSettings) {
+        menuSettings.style.display = 'none';
+    }
 }
```

---

## ⚠️ Exposição de Chaves API (Supabase Anon Key)

> [!WARNING]
> A chave `anon` do Supabase está exposta diretamente no código-fonte de **11 arquivos**. Embora a `anon key` seja projetada para uso público, uma proteção adicional com **Row Level Security (RLS)** é essencial.

### Arquivos com chave exposta:

| Arquivo | Linha | Tipo |
|---------|-------|------|
| `index.html` | L5198, L7027 | **Produção** (CRÍTICO) |
| `2026_script.js` | L39 | **Produção** |
| `fixed_encoding.html` | L2554 | Legado |
| `fixed_script.js` | L347 | Legado |
| `insert_handlers.js` | L4 | Script utilitário |
| `check_db.js` | L4 | Script utilitário |
| `check_locs.js` | L4 | Script utilitário |
| `check_tesoura.js` | L4 | Script utilitário |
| `insert_processes.js` | L6 | Script utilitário |
| `insert_tratando.js` | L3 | Script utilitário |
| `check_user_schema.js` | L4 | Script utilitário |
| `test_dept_column.js` | L4 | Script utilitário |

### Recomendações:
1. **Ativar RLS** em todas as tabelas do Supabase
2. **Remover scripts utilitários** do repositório público (ou movê-los para `.gitignore`)
3. Considerar usar variáveis de ambiente em um build process futuro

---

## ✅ Controle de Overlay de Login

O sistema **bloqueia** corretamente o acesso visual via overlay de login quando não há sessão ativa:
- [index.html L7305-7309](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/index.html#L7305-L7309) — quando `session` é `null`, o overlay é exibido

> [!NOTE]
> O overlay é uma proteção visual, mas **NÃO é uma proteção real**. Um usuário técnico pode facilmente remover o overlay via DevTools e acessar a interface. A segurança real depende do Supabase RLS.

---

## 📋 Checklist de Segurança

- [ ] **Corrigir RBAC para CONVIDADO** — Esconder menu "Configurações" quando perfil não encontrado
- [ ] **Adicionar proteção no `openConfigModal`** — Bloquear acesso a modais se role não for 'administrador'
- [ ] **Ativar RLS no Supabase** — Garantir que a API não retorne dados sem autenticação válida
- [ ] **Remover scripts utilitários do git** — `check_*.js`, `insert_*.js`, `test_*.js`
- [ ] **Auditar funções de CRUD** — Garantir que operações de escrita/exclusão verificam o role do usuário
- [ ] **Substituir `confirm()` por modal customizado** no logout (para melhor UX e testabilidade)

---

## Próximos Passos

Deseja que eu implemente as correções de segurança imediatamente? As prioridades seriam:
1. 🔴 **CRÍTICO:** Corrigir o bug RBAC do CONVIDADO
2. 🟡 **ALTO:** Adicionar proteções no `openConfigModal`
3. 🟢 **MÉDIO:** Limpar scripts utilitários do repositório
