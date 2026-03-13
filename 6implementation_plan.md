## 💅 Refinamentos de UI/UX (Feedback do Usuário)

### 📌 Cabeçalho Fixo (Sticky Header)
- **Tabela:** Adicionar `position: sticky; top: 0;` aos cabeçalhos (`th`) da tabela de processos para que permaneçam visíveis durante a rolagem.
- **Cor:** Garantir que o fundo do cabeçalho seja sólido para não sobrepor o conteúdo da tabela.

### 📊 Ajuste nos Gráficos de Barras
- **Datalabels:** Alterar o posicionamento para `anchor: 'end'` e `align: 'end'` (ou ajuste similar) para evitar que os valores fiquem confusos ou sobrepostos, especialmente em barras pequenas.
- **Visibilidade:** Melhorar o contraste e o posicionamento do texto informativo nos gráficos.

### 📐 Dimensão dos Filtros
- **Altura:** Reduzir a altura dos campos de entrada e seleção de `38px` para `34px`, tornando a interface mais compacta e profissional.
- **Espaçamento:** Refinar o padding interno para manter a legibilidade com a nova altura.

## Plano de Verificação

### Testes Manuais
- Verificar se os números dos cards aparecem coloridos e funcionais.
- Confirmar se os gráficos exibem valores e % internamente em branco.
- Clicar nos títulos das colunas (ex: P.P.ANO, Fornecedor) e verificar se a tabela ordena corretamente.
- Verificar se os valores monetários estão com `R$`.
- Inserir um processo sem data de conclusão e confirmar que não aparece [(NaNd)](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/2026%20Infra%20Sistemas.html#2869-2879).
