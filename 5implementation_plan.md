# Refinamento de Filtros e Modal de Detalhes

Este plano visa organizar os campos de busca para melhor usabilidade e criar um modal completo de visualização de processos, permitindo ver todos os dados e o histórico de tramitações de forma profissional.

## Alterações Propostas

### 🎨 Layout de Filtros
- **Redimensionamento:** Alterar o grid de filtros de `1fr 1fr 1fr` para `2fr 1fr 1fr`, priorizando o campo de busca textual.
- **Estilização:** Adicionar ícones de pesquisa e melhorar o preenchimento (padding) dos campos para uma aparência mais moderna.
- **Funcionamento:** Garantir que os filtros de Status e Localização funcionem em conjunto com a busca textual.

### 📋 Modal de Detalhes do Processo
- **Gatilho:** Adicionar evento de clique em toda a linha da tabela para abrir os detalhes.
- **Layout do Modal:**
    - Cabeçalho com destaque para o número do P.P. e Status.
    - Seções organizadas por "Informações Gerais", "Datas e Prazos" e "Localização Atual".
    - Timeline vertical estilizada para o histórico de tramitações (fluxo do processo).
    - Exibição completa de campos longos (Objeto e Observações).
- **Ações Rápidas:** Incluir botões de "Editar" e "Excluir" dentro do modal de detalhes para fácil acesso.

## Plano de Verificação

### Testes Manuais
- Verificar se os números dos cards aparecem coloridos e funcionais.
- Confirmar se os gráficos exibem valores e % internamente em branco.
- Clicar nos títulos das colunas (ex: P.P.ANO, Fornecedor) e verificar se a tabela ordena corretamente.
- Verificar se os valores monetários estão com `R$`.
- Inserir um processo sem data de conclusão e confirmar que não aparece [(NaNd)](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/2026%20Infra%20Sistemas.html#2660-2670).
