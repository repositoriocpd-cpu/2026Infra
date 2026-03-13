## 💅 Refinamentos de UI/UX e Exportação Seletiva

### 📌 Cabeçalho da Tabela Congelado (Sticky Header)
- **Correção:** Garantir que o cabeçalho da tabela (`th`) fique fixo no topo ao rolar. Para isso, a tabela será envolvida em um container com altura máxima (`max-height`) e rolagem própria.
- **Estilo:** Manter o fundo sólido e sombras sutis para destacar o cabeçalho durante a rolagem.

### 📐 Filtros Mais Compactos
- **Altura:** Reduzir a altura dos campos de "Pesquisar", "Status" e "Localização" de 34px para **30px**.
- **Tipografia:** Ajustar o tamanho da fonte para manter a harmonia com o tamanho reduzido.

### 📄 Exportação PDF Seletiva
- **Marcação de Colunas:** Adicionar mini-checkboxes em cada cabeçalho da tabela. O usuário poderá "marcar" quais colunas deseja incluir no relatório.
- **Lógica de Exportação:** Atualizar a função [exportToPDF](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/2026%20Infra%20Sistemas.html#3459-3535) para ler apenas as colunas que estiverem marcadas no momento do clique.

## Plano de Verificação

### Testes Manuais
- Verificar se os números dos cards aparecem coloridos e funcionais.
- Confirmar se os gráficos exibem valores e % internamente em branco.
- Clicar nos títulos das colunas (ex: P.P.ANO, Fornecedor) e verificar se a tabela ordena corretamente.
- Verificar se os valores monetários estão com `R$`.
- Inserir um processo sem data de conclusão e confirmar que não aparece [(NaNd)](file:///h:/2026%20SISTEMAS/2025%20Infra%20Sistemas%20YASMIN/2026%20Infra%20Sistemas.html#2881-2891).
