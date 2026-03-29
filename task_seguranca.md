# Tarefas - Correções de Segurança (Fase 1)

- `[x]` 1. **Atualizar `supabase_schema.sql`**
  - `[x]` 1.1 Criar a tabela `user_profiles` ligada à `auth.users` com o campo `role`.
  - `[x]` 1.2 Remover as políticas de RLS "Allow anonymous access to all" (`USING (true)`).
  - `[x]` 1.3 Adicionar políticas RLS restritivas para tabelas de configuração (`suppliers`, `locations`, `objects`, `statuses`, `handlers`).
  - `[x]` 1.4 Adicionar políticas RLS restritivas para tabelas principais (`processes`, `process_history`).
  - `[x]` 1.5 Adicionar políticas RLS para a nova tabela `user_profiles`.

- `[x]` 2. **Atualizar `index.html`**
  - `[x]` 2.1 Modificar o bloco `else` na verificação do `profile` para garantir `currentUserRole = 'convidado'` e ocultar os menus.
  - `[x]` 2.2 Tratar erros de permissão (`401/403`) no `openConfigModal`.

- `[x]` 3. **Verificação Final**
  - `[x]` 3.1 Garantir ausência de vulnerabilidade de bypass RBAC via DevTools.
