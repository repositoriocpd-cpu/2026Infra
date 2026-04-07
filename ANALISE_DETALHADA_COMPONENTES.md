# ANÁLISE DETALHADA: ARQUITETURA DE COMPONENTES
## SUB INFRA PANEL v1.0.6 - Vanilla JavaScript SPA

**Documento**: Análise profunda de componentes, padrões e estrutura interna  
**Data**: Março 2026  
**Foco**: Código específico, números de linha, exemplos práticos

---

## 1. ESTRUTURA DE COMPONENTES

### 1.1 Padrão de Componentes (Modal-Based)

O SUB INFRA PANEL usa um padrão baseado em **modais HTML** que funcionam como componentes. Não são componentes React/Vue, mas HTML estruturados no DOM com JavaScript imperativo.

**Exemplo: Process Control Modal**

```html
<!-- index.html, linhas ~2000-2100 -->
<div id="processControlModal" class="modal" style="display:none;">
  <div class="modal-content" style="max-width: 90%; max-height: 90vh;">
    <span class="close" onclick="closeModal('processControlModal')">&times;</span>
    <h2>Adicionar / Editar Processo</h2>
    
    <form id="processForm">
      <input type="hidden" id="processId" value="">
      <input type="text" id="processName" placeholder="Nome do Processo" required>
      <select id="processType" required>
        <option value="">Selecione o Tipo</option>
      </select>
      <!-- mais campos... -->
    </form>
  </div>
</div>
```

**Como funciona:**
- **Estado**: Armazenado em `window.state.processes = []` (2026_script.js, linha 47)
- **Renderização**: Função `window.renderProcessTable()` (linha 583)
- **Eventos**: `addEventListener()` no formulário (linha 666)
- **Ciclo de vida**: openModal() → preenchData() → submitForm() → updateTable() → closeModal()

---

### 1.2 Component Props Pattern (Via Atributos e Global State)

Como passar dados para um "componente"? Neste projeto, usa-se atributos HTML e `window.state`:

**Exemplo: Supplier Select Component**

```javascript
// 2026_script.js, linhas 886-915
window.updateSelects = async function() {
  const suppliers = window.state.suppliers;
  const selectElement = document.getElementById('processSupplier');
  
  // "Props" via window.state
  const choices = new Choices(selectElement, {
    itemSelectText: 'Clique para selecionar',
    placeholderValue: 'Escolha um fornecedor',
    searchEnabled: true,
    // Dados passados implicitamente via window.state
  });
  
  // Popular com dados (simulando props)
  suppliers.forEach(supplier => {
    choices.setChoices([
      { value: supplier.id, label: supplier.name, selected: false }
    ], 'value', 'label', true);
  });
};
```

**O padrão "props":**
- **Input**: dados em `window.state.suppliers`
- **Processing**: função `updateSelects()`
- **Output**: DOM atualizado com `Choices.js` library
- **Estado compartilhado**: Todos os "componentes" acessam `window.state`

---

### 1.3 Composição de Componentes (Config Array Pattern)

Componentes são compostos usando **arrays de configuração**. Exemplo com selects:

```javascript
// 2026_script.js, exemplo de padrão
const selectsConfig = [
  {
    id: 'processSupplier',
    label: 'Fornecedor',
    dataSource: 'suppliers',
    required: true
  },
  {
    id: 'processType',
    label: 'Tipo de Processo',
    dataSource: 'types',
    required: true
  },
  {
    id: 'processLocation',
    label: 'Localização',
    dataSource: 'locations',
    required: true
  }
];

// Renderizar todos de uma vez
selectsConfig.forEach(config => {
  const select = document.getElementById(config.id);
  const data = window.state[config.dataSource];
  // ... preencher select
});
```

**Benefício**: Evita repetição de código  
**Limitação**: Apenas selects, sem flexibilidade para outras estruturas

---

### 1.4 Reusable Form Submission Pattern

Os formulários seguem um padrão reutilizável:

```javascript
// 2026_script.js, linhas 666-767
document.getElementById('processForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    // 1. Validar dados
    const formData = {
      name: document.getElementById('processName').value.trim(),
      type_id: parseInt(document.getElementById('processType').value),
      supplier_id: parseInt(document.getElementById('processSupplier').value),
      location_id: parseInt(document.getElementById('processLocation').value)
    };
    
    if (!formData.name) throw new Error('Nome é obrigatório');
    if (formData.type_id <= 0) throw new Error('Tipo é obrigatório');
    
    // 2. Detectar INSERT vs UPDATE
    const processId = document.getElementById('processId').value;
    const isUpdate = processId && processId !== '';
    
    // 3. Enviar para Supabase
    const operation = isUpdate 
      ? supabase.from('processes').update(formData).eq('id', processId)
      : supabase.from('processes').insert([formData]);
    
    const { data, error } = await operation;
    
    if (error) throw error;
    
    // 4. Atualizar estado local
    if (isUpdate) {
      const idx = window.state.processes.findIndex(p => p.id == processId);
      window.state.processes[idx] = { ...window.state.processes[idx], ...formData };
    } else {
      window.state.processes.push({ id: data[0].id, ...formData });
    }
    
    // 5. Re-renderizar
    window.renderProcessTable();
    closeModal('processControlModal');
    
    // 6. Feedback ao usuário
    alert('Processo salvo com sucesso!');
    
  } catch (error) {
    console.error('Erro ao salvar processo:', error);
    alert('Erro: ' + error.message);
  }
});
```

**Padrão observado:**
1. Prevent default + try-catch
2. Validação básica (trim, parseFloat, parseint)
3. Lógica INSERT/UPDATE unificada
4. Supabase call com tratamento de erro
5. Atualizar `window.state`
6. Chamar função de renderização
7. Fechar modal e alertar sucesso

---

## 2. SISTEMA DE MODAIS

### 2.1 Modal Lifecycle

```
                  ┌─────────────────┐
                  │  closeModal()   │
                  │  (linha 1225)   │
                  └────────┬────────┘
                           │
                    ┌──────▼──────┐
                    │ style.display│
                    │    = 'none'  │
                    └─────────────┘
                           ▲
                           │
                  ┌────────┴────────┐
                  │                 │
         ┌────────▼────────┐  ┌─────▼──────────┐
         │ submitForm()    │  │ User clicks ✕  │
         │ (validação OK)  │  │ (onclick)      │
         └────────┬────────┘  └────────────────┘
                  │
         ┌────────▼────────────────────┐
         │ Fechar & Re-renderizar      │
         │ renderProcessTable()        │
         └─────────────────────────────┘
                  ▲
                  │
         ┌────────┴────────┐
         │                 │
┌────────▼────┐   ┌────────▼─────────┐
│openModal()  │   │Erro na validação │
│(linha 1208) │   │(catch block)     │
└────────┬────┘   └─────────────────┘
         │
┌────────▼──────────────────────┐
│element.style.display = 'block'│
│Preencher dados (se edição)    │
│Focus no primeiro input        │
└───────────────────────────────┘
```

**Funções principais:**

```javascript
// 2026_script.js, linhas 1208-1228
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    // Focus no primeiro input
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    // Limpar formulário
    const form = modal.querySelector('form');
    if (form) form.reset();
  }
};
```

**Problema observado**: Não há validação do `modalId` - ataque XSS possível se controlado por usuário

---

### 2.2 Modal State Management

Estado do modal é gerenciado implicitamente:

```javascript
// Quando modal abre:
window.editingProcessId = null; // ou ID se editando

// Quando formulário é enviado:
if (window.editingProcessId) {
  // UPDATE
} else {
  // INSERT
}

// Quando modal fecha:
window.editingProcessId = null;
```

**Problema**: Não há estado centralizado para quais modais estão abertos. Se dois modais abrem simultaneame
