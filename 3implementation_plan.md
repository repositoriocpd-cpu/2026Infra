# Plano de Inserção de Dados em Lote

Este plano descreve a inserção de novos processos no banco de dados Supabase a partir de uma lista JSON fornecida pelo usuário.

## Mudanças Propostas

### Interface do Usuário (UI)
- **Menu Lateral:**
    - Adicionar um botão "X" (ícone `fa-times`) no cabeçalho do menu lateral.
    - Estilizar o botão para que fique alinhado à direita no cabeçalho azul.
- **Tabela de Processos:**
    - Na coluna "Ações", adicionar um botão vermelho (ícone `fa-trash`) para exclusão.
    - Corrigir a coluna "Localização" para exibir uma string vazia em vez de "null" quando o dado estiver ausente.

### Funcionalidade (JS)
- **Excluir Processo:**
    - Implementar a função `deleteProcess(id)` que:
        - Solicita confirmação do usuário.
        - Remove o registro da tabela `processes` no Supabase.
        - Atualiza o estado local (`window.state.processes`).
        - Re-renderiza a tabela e os contadores do dashboard.
- **Menu:**
    - Garantir que o botão "X" chame a função [toggleMenu()](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/2026%20Infra%20Sistemas.html#2409-2421) existente.

## Plano de Verificação

### Testes Manuais
- Abrir o menu lateral e clicar no "X" para verificar se ele fecha corretamente.
- Acessar a "Consulta de Cadastros" e verificar se processos sem localização mostram a célula vazia.
- Clicar no botão de excluir em um processo de teste e confirmar se ele desaparece da lista e se os cards de KPI são atualizados.
