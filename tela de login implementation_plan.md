# Tela de Login

Este plano de implementação adicionará uma camada de login para proteger o sistema conforme os parâmetros solicitados.

## Proposed Changes

### 1. Camada Visual (HTML/CSS) no `2026 Infra Sistemas.html`
*   Injetaremos um novo bloco `<div id="login-overlay">` logo no início da tag `<body>`.
*   Este bloco possuirá `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999;` para cobrir absolutamente tudo. O fundo será na cor cinza bem clara `#f4f6f9`.
*   O card de login terá o topo azul com a logo da prefeitura e o título "SMEDU | INFRAESTRUTURA".
*   Os campos do formulário (E-mail e Senha) terão validação visual. Um ícone de olho será colocado no input de senha para permitir alternar o tipo de `password` para `text`.

### 2. Lógica de Validação (JS)
*   Criaremos a função `handleLogin()` que validará as credenciais fixadas:
    *   **Usuário**: `cpdinfra@edu.itaguai.rj.gov..br` (com o duplo ponto no final)
    *   **Senha**: `T3c4n3x0`
*   Se os dados estiverem corretos, `document.getElementById('login-overlay').style.display = 'none';` será acionado.
*   Se incorretos, o sistema exibirá o alerta padrão "E-mail ou senha incorretos".
*   A alternância da visibilidade da senha funcionará mudando o atributo `type` do input ao clicar no ícone do olho.

## Verification Plan

### Testes Manuais
1.  Acessar o sistema (`http://localhost:8080/2026%20Infra%20Sistemas.html`) e verificar se a tela de login inicial bloqueia o acesso ao conteúdo do sistema (Painel VIP / Dashboard).
2.  Testar botão do "olhinho" da senha digitando alguma letra e avaliando sua revelação/ocultação.
3.  Tentar um login inválido qualquer para verificar a exibição de mensagem de erro.
4.  Inserir `cpdinfra@edu.itaguai.rj.gov.br` e `T3c4n3x0`. Clicar em "Entrar" e observar se a tela de login some, dando acesso aos gráficos.
