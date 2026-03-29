# Correções de Vulnerabilidades Críticas de Segurança

Implementação das recomendações apontadas no relatório de segurança para mitigar vulnerabilidades como o bypass de RBAC, exposição de perfis e Row Level Security (RLS) aberto no Supabase.

## User Review Required

> [!WARNING]
> Migrar de uma SPA/PWA vanilla (HTML/JS) para o **Next.js** é uma mudança arquitetural gigantesca (exigiria reescrever toda a interface em React e alterar o roteamento/sistema).
> 
> Para atuar com a urgência solicitada (Correções imediatas), propomos a seguinte abordagem em **duas fases**:
> - **Fase 1 (Imediata):** Corrigir a lógica de RBAC no `index.html` e implementar RLS estrito no banco (`supabase_schema.sql`), além de criar a tabela vinculativa `user_profiles`. Isso garantirá que o banco negue qualquer alteração de um usuário não-admin, mesmo que o frontend seja fraudado (resolvendo a vulnerabilidade "Não confiar no front-end").
> - **Fase 2 (Estratégico):** Planejar e migrar o código gradualmente para Next.js, onde chaves de API ficarão em variáveis de ambiente no lado do servidor.
> 
> Você aprova fecharmos primeiro a Fase 1 (banco de dados + patch no HTML atual) para bloquearmos a fraude imediatamente?

## Proposed Changes

### Regras de Banco e Perfis (Supabase)

#### [MODIFY] [supabase_schema.sql](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/supabase_schema.sql)
- **Criação da tabela `user_profiles`**: Mapeada ao `auth.users`, contendo os campos `full_name`, `department` e `role` com default `'convidado'`.
- **Destruição do RLS Aberto**: Remover `CREATE POLICY "Allow anonymous access to all" ON ... USING (true);`.
- **Políticas Restritivas (RLS)**:
  - Adicionar política de `SELECT`, `INSERT`, `UPDATE` e `DELETE` em `user_profiles`, permitindo ao usuário editar apenas o próprio perfil (porém com o `role` sendo editável apenas por admins).
  - Adicionar controle granular em `processes` e demais regras de tabelas (ex: apenas usuários logados têm `SELECT`; e apenas admins podem gravar/apagar registros essenciais do sistema).
  - Com essa blindagem RLS, modificar o `currentUserRole` no console não terá nenhum efeito prático (Postgres vai rejeitar as requisições falsificadas).

### Lógica da Interface (Frontend)

#### [MODIFY] [index.html](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/index.html)
- **Correção da falha do "CONVIDADO"**: Tratar explícitamente o bloco `else` (quando o perfil não for encontrado no banco de dados) para forçar que todo menu restrito seja ocultado via display flex/none.
- Reforçar o tratamento de exceção sobre permissões caso o Supabase gere erro 403 (RLS policy violation), transformando mensagens cruas em alertas polidos, já que agora o banco fará a trava oficial.

## Open Questions

1. Em relação à tabela `user_profiles`, qual é o papel (`role`) padrão para qualquer novo usuário que acabe de se registrar via e-mail e ainda não tenha sido promovido? Seria `convidado` mesmo?
2. Há alguma política específica onde usuários comuns podem criar processos novos, ou estritamente só quem tiver permissão de admin/operador pode manipular (escrever) dados em `processes` e `process_history`? 
3. Você aprova focar neste patch de RLS e RBAC agora e deixarmos o novo design no Next.js como um projeto focado para logo em seguida?

## Verification Plan

### Automated Tests
- Revisar a exportação do schema para garantir zero tabelas com acesso anônimo usando `USING (true)`.

### Manual Verification
1. Logar com um usuário comum/convidado e verificar visualmente a total indisponibilidade de ferramentas no front.
2. Tentar fraudar no console de desenvolvedor via JavaScript: `window.currentUserRole = 'administrador'; window.openConfigModal('users');`.
3. Validar se uma alteração invasiva via Supabase API bloqueia e emite `403 Forbidden` devido às novas restrições de RLS.
