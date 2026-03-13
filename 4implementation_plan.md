# Plano de Inserção de Dados em Lote

Este plano descreve a inserção de novos processos no banco de dados Supabase a partir de uma lista JSON fornecida pelo usuário.

## Mudanças Propostas

### Dashboard & Gráficos
- **Cards do Dashboard:**
    - Corrigir o estado inicial dos cards para que não fiquem em branco.
    - Adicionar cores específicas para os números (Azul Logo para Totais, Verde para Liquidados, Vermelho para Vencidos).
- **Gráficos (Chart.js):**
    - **Cores:** Paletas dinâmicas e vibrantes para barras e doughnut.
    - **Plugin Datalabels:** Configurar para exibir Valor e Porcentagem dentro dos elementos.
    - **Estilo:** Texto em branco, fonte sans-serif moderna.

### Tabela de Processos
- **Formatação de Moeda:** Usar `Intl.NumberFormat` para converter o "Valor Capa" em Real Brasileiro (`R$ 0.000,00`).
- **Tratamento de Datas:** Ajustar o cálculo de dias restantes para retornar vazio se a data de conclusão estiver ausente, eliminando o erro [(NaNd)](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/2026%20Infra%20Sistemas.html#2646-2653).
- **Ordenação Dinâmica:** 
    - Adicionar indicadores visuais de ordenação nos cabeçalhos (`th`).
    - Implementar lógica de clique para ordenar por qualquer coluna (texto, número ou data).

### Funcionalidade (JS)
- **Bibliotecas:** Incluir `chartjs-plugin-datalabels` via CDN.
- **Lógica de Tabela:** Criar a função `sortTable(columnField)` e integrá-la ao renderizador.
- **Correção dos Cards:** Forçar a atualização visual após o [initApp](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/2026%20Infra%20Sistemas.html#2585-2619).

## Plano de Verificação

### Testes Manuais
- Verificar se os números dos cards aparecem coloridos e funcionais.
- Confirmar se os gráficos exibem valores e % internamente em branco.
- Clicar nos títulos das colunas (ex: P.P.ANO, Fornecedor) e verificar se a tabela ordena corretamente.
- Verificar se os valores monetários estão com `R$`.
- Inserir um processo sem data de conclusão e confirmar que não aparece [(NaNd)](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/2026%20Infra%20Sistemas.html#2646-2653).
