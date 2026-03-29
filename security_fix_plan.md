# Plano de Implementação: Correção de Segurança e Reforço de RBAC

Este plano visa corrigir as vulnerabilidades identificadas na auditoria de segurança, garantindo que usuários sem perfil definido (Convidados) ou sem privilégios administrativos não acessem áreas sensíveis do sistema.

## User Review Required

> [!IMPORTANT]
> A remoção de scripts utilitários (`check_*.js`, `insert_*.js`) pode afetar ferramentas de manutenção local que você utiliza. Eles serão movidos para uma pasta de backup ou ignorados pelo Git.

## Proposed Changes

### [Component Name] Segurança e Controle de Acesso

#### [MODIFY] [index.html](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/index.html)
- **Correção RBAC (Convidado):** Alterar a função `updateUserInfo` para garantir que o menu "Configurações" seja explicitamente escondido (`display: none`) caso o perfil do usuário não seja encontrado ou não tenha a role de 'administrador'.
- **Proteção de Modais:** Adicionar verificações de `window.currentUserRole` dentro da função `openConfigModal` e outras funções administrativas para impedir a abertura via console do navegador.
- **Melhoria no Logout:** Substituir o `confirm()` nativo por um modal customizado ou garantir que o estado local seja completamente limpo antes do reload.

#### [DELETE] Scripts Utilitários Expostos
- Remover do rastreamento do Git (ou deletar se não forem mais necessários) os seguintes arquivos que contêm chaves de API:
    - `check_db.js`, `check_locs.js`, `check_tesoura.js`, `check_user_schema.js`
    - `insert_handlers.js`, `insert_processes.js`, `insert_tratando.js`
    - `test_dept_column.js`

#### [MODIFY] [.gitignore](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/.gitignore)
- Adicionar os scripts de manutenção e arquivos temporários ao `.gitignore` para evitar futuras exposições de chaves.

## Open Questions

- Você utiliza algum dos scripts `check_*.js` ou `insert_*.js` no seu fluxo de trabalho diário? Se sim, prefere que eu os mova para uma pasta chamada `tools/` e os adicione ao `.gitignore` em vez de excluí-los?

## Verification Plan

### Automated Tests
- Usar o `browser_subagent` para tentar acessar o menu de configurações logado como um usuário sem privilégios.
- Verificar se as chamadas para `openConfigModal()` via console são bloqueadas com um alerta adequado.

### Manual Verification
- Validar se o logout funciona sem deixar resíduos de sessão no localStorage ou no cabeçalho.
