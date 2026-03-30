# ANÁLISE DETALHADA: PADRÕES DE CÓDIGO E DÍVIDA TÉCNICA
## SUB INFRA PANEL v1.0.6

**Documento**: Padrões observados, anti-padrões, refatoração  
**Data**: Março 2026

---

## 1. PADRÕES CÓDIGO ATUAIS

### 1.1 Global State Pattern

**Como é:**
```javascript
// 2026_script.js, linha 47
window.state = {
  processes: [],
  suppliers: [],
  types: [],
  locations: [],
  filterType: null,
  searchTerm: '',
  chartData: null,
  isLoading: false
};

// Uso
window.state.processes.push(newProcess);
window.renderProcessTable(); // Re-renderizar
```

**Problemas:**
- Sem reatividade (mudança de estado não atualiza automaticamente)
- Sem histórico (undo/redo difícil)
- Sem validação de tipo
- Globais = colisões de namespace

**Alternativas modernas:**

```javascript
// Opção 1: Zustand (lightweight)
import { create } from 'zustand';

const useAppStore = create((set) => ({
  processes: [],
  suppliers: [],
  
  addProcess: (process) => set(state => ({
    processes: [...state.processes, process]
  })),
  
  removeProcess: (id) => set(state => ({
    processes: state.processes.filter(p => p.id !== id)
  }))
}));

// Uso
const { processes, addProcess } = useAppStore();

// Opção 2: Redux
const initialState = {
  processes: [],
  suppliers: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_PROCESS':
      return {
        ...state,
        processes: [...state.processes, action.payload]
      };
    default:
      return state;
  }
};

// Opção 3: Vue Composition API (mais simples)
import { reactive } from 'vue';

const state = reactive({
  processes: [],
  suppliers: []
});

function addProcess(process) {
  state.processes.push(process);
  // Vue reactivo = auto-render
}
```

---

### 1.2 Manual Re-render Pattern

**Como é:**
```javascript
// 2026_script.js, linhas 583-645
window.renderProcessTable = function() {
  const tableBody = document.querySelector('#processesTable tbody');
  tableBody.innerHTML = ''; // ❌ Limpar tudo
  
  window.state.processes.forEach(process => {
    const row = document.createElement('tr');
    // ... criar conteúdo
    tableBody.appendChild(row);
  });
};

// Chamar manualmente após cada mudança
window.state.processes.push(newProcess);
window.renderProcessTable(); // ❌ Chamada manual
```

**Problemas:**
- Fácil esquecer de chamar render
- Re-renderiza TUDO (ineficiente)
- Sem virtual DOM = lento com muitos registros

**Padrão melhor - Virtual DOM:**

```javascript
// Usar Preact ou Inferno (leve como vanilla, mas com render automático)
import { render, h } from 'preact';

function ProcessTable({ processes, onEdit, onDelete }) {
  return h('table', { id: 'processesTable' },
    h('tbody', null,
      processes.map(process =>
        h('tr', { key: process.id },
          h('td', null, process.id),
          h('td', null, process.name),
          h('td', null,
            h('button', { onClick: () => onEdit(process.id) }, 'Editar'),
            h('button', { onClick: () => onDelete(process.id) }, 'Deletar')
          )
        )
      )
    )
  );
}

// Render automático quando state muda
function App() {
  const [processes, setProcesses] = useState([]);
  
  return ProcessTable({ 
    processes,
    onEdit: editProcess,
    onDelete: deleteProcess
  });
}

render(h(App), document.body);
```

---

### 1.3 Modal Toggle Pattern

**Como é:**
```javascript
// 2026_script.js, linhas 1208-1228
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'block';
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
};

// Usar
document.getElementById('addBtn').onclick = () => openModal('processModal');
document.getElementById('closeBtn').onclick = () => closeModal('processModal');
```

**Problemas:**
- Sem animações suaves
- Sem escape key handling
- Modal ID como string = typo prone

**Padrão melhor:**

```javascript
// Usar classe reutilizável
class Modal {
  constructor(id) {
    this.id = id;
    this.element = document.getElementById(id);
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close(); // Fechar ao clicar fora
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }
  
  open(data = {}) {
    this.element.classList.add('modal-open');
    this.element.style.animation = 'fadeIn 0.3s';
    this.onOpen?.(data);
  }
  
  close() {
    this.element.classList.remove('modal-open');
    this.element.style.animation = 'fadeOut 0.3s';
    setTimeout(() => {
      this.element.style.display = 'none';
    }, 300);
  }
  
  isOpen() {
    return this.element.classList.contains('modal-open');
  }
  
  onOpen(callback) {
    this.onOpen = callback;
    return this;
  }
}

// Uso
const processModal = new Modal('processControlModal');
document.getElementById('addBtn').onclick = () => processModal.open();
document.getElementById('closeBtn').onclick = () => processModal.close();

// Com dados
processModal.onOpen((data) => {
  document.getElementById('processName').value = data.name || '';
});
```

---

## 2. ANTI-PADRÕES OBSERVADOS

### 2.1 Inline Styles

**Anti-padrão:**
```html
<!-- index.html -->
<div style="display: block; color: red; font-size: 16px;">
  Texto importante
</div>

<!-- Depois no JS -->
<script>
  element.style.display = 'none'; // Mistura lógica com apresentação
</script>
```

**Problema:**
- Difícil fazer temas
- Difícil manter responsividade
- CSS em HTML = violação de separação de conceitos

**Solução:**

```css
/* style.css */
.important {
  color: red;
  font-size: 16px;
}

.important.hidden {
  display: none;
}

.theme-dark .important {
  color: #ff6b6b;
}
```

```javascript
// JavaScript usa classes
element.classList.add('hidden');
element.classList.remove('hidden');
element.classList.toggle('hidden');
```

---

### 2.2 Truthy/Falsy Checks

**Anti-padrão:**
```javascript
// 2026_script.js (observado)
if (user) { } // user pode ser null, undefined, false, 0, ''
if (data.length) { } // Não funciona com 0 registros
if (count) { } // 0 é falsy!
```

**Problema:**
- Bugs sutis com valores 0, false, '', []
- Não claro qual tipo se espera

**Solução:**

```javascript
// Explícito
if (user !== null && user !== undefined) { }
if (user !== null) { }
if (typeof user === 'object' && user !== null) { }

// Com optional chaining
if (user?.id) { }

// Com nullish coalescing
const count = data?.length ?? 0;

// Com operador estrito
if (Array.isArray(data) && data.length > 0) { }
```

---

### 2.3 String Interpolation em HTML

**Anti-padrão:**
```javascript
// Observado em 2026_script.js
row.innerHTML = `
  <button onclick="editProcess(${process.id})">
    Editar
  </button>
`;
```

**Problemas:**
- XSS risk
- String parsing confuso
- Difícil debugar

**Solução:**

```javascript
// createElement + textContent
const btn = document.createElement('button');
btn.textContent = 'Editar';
btn.dataset.processId = process.id;
btn.addEventListener('click', () => editProcess(process.id));

// Ou template literals com sanitização
const html = sanitizeHtml(`
  <button onclick="editProcess('${escapeHtml(process.id)}')">
    Editar
  </button>
`);
```

---

### 2.4 Magic Strings/Numbers

**Anti-padrão:**
```javascript
// Observado em diversos places
if (userRole === 'administrador') { } // Magic string
if (userRole === 'operador') { }
if (userRole === 'convidado') { }

if (priority === 1) { } // Magic number
if (priority === 2) { }
if (priority === 3) { }
```

**Solução:**

```javascript
// Usar constantes
const ROLES = {
  ADMIN: 'administrador',
  OPERATOR: 'operador',
  GUEST: 'convidado'
};

const PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
};

// Usar
if (userRole === ROLES.ADMIN) { }
if (priority === PRIORITY.HIGH) { }

// Enum pattern
const ROLES_ENUM = Object.freeze({
  ADMIN: 'administrador',
  OPERATOR: 'operador',
  GUEST: 'convidado'
});
```

---

## 3. DÍVIDA TÉCNICA ESTIMADA

| Item | Severidade | Esforço | Impacto 
