# Plano de Implementação: Soluções de Acesso, UX e Deploy

Este plano final endereça todas as solicitações pendentes para garantir a estabilidade e usabilidade do sistema antes do deploy definitivo.

## User Review Required

> [!IMPORTANT]
> - **Garantia de Acesso Administrador:** Corrigiremos o erro que impede a visualização dos menus de Configurações, Gestão de Usuários, Backup e Logs. A falha ocorre devido a uma verificação sensível a maiúsculas no cargo.
> - **Super Admin:** O usuário `cpdinfra@edu.itaguai.rj.gov.br` será configurado com permissão total permanente via código.
> - **Deploy GitHub:** Realizaremos o deploy para a branch `Infra2026` após a validação das correções.

## Proposed Changes

### [Component Name] Segurança e RBAC (Controle de Acesso)

#### [MODIFY] [index.html](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/index.html)
- **Correção da Visibilidade do Menu:**
    - Ajustar `updateUserInfo` para usar `.toLowerCase().trim()` na comparação de cargos (`profile.role`).
    - Garantir que os IDs `menu-settings`, `menu-backup` e `menu-logs` sejam alterados para `display: block` quando logado como administrador.
- **Super Admin Bypass:**
    - Implementar lógica que force `window.currentUserRole = 'administrador'` se o e-mail for `cpdinfra@edu.itaguai.rj.gov.br`.

---

### [Component Name] UX (Interface do Usuário)

#### [MODIFY] [index.html](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/index.html)
- **Correção do Tour:** Remover a linha `8038` que gera o título duplicado fora da faixa azul.

#### [MODIFY] [pwa-handler.js](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/pwa-handler.js)
- **Filtro de Instalação:** Não oferecer instalação se `pwa_installed` estiver no `localStorage`.
- **Design de Atualização:** Aplicar o fundo verde premium e estilo glassmorphism ao banner de atualização.

---

### [Component Name] Deployment

- **Versionamento e Deploy:**
    - `git add .`
    - `git commit -m "fix: admin visibility and tour fixes, feat: superadmin and pwa optimization"`
    - `git push origin Infra2026`

## Open Questions

- Nenhuma no momento. As tarefas estão alinhadas com as especificações governamentais e de segurança.

## Verification Plan

### Automated Tests
- Usar `browser_subagent` para confirmar que após o login de administrador (simulado ou real), os menus de Configuração, Backup e Logs estão visíveis.

### Manual Verification
- Testar o tour e a transição do banner de instalação para o de atualização.
