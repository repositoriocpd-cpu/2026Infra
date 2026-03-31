# Codebase Search Results - Process Management System

## 1. PROCESS TABLE STRUCTURE - AÇÕES COLUMN

### Location: index.html
- **File**: E:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html
- **Line 4088**: Table header definition
  ```html
  <th>Ações</th>
  ```
- **Line 4091**: Empty tbody for dynamic population
  ```html
  <tbody id="processTableBody"></tbody>
  ```

### Location: 2026_script.js
- **File**: E:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\2026_script.js
- **Lines 634-698**: Function `renderProcessTable()` - Creates table rows with Ações column
  
  Key section (lines 689-695):
  ```javascript
  <td onclick="event.stopPropagation();">
      <div style="display:flex; flex-direction: row; gap:4px; align-items:center;">
          <button class="btn btn-warning" style="padding:4px; width:28px; height:28px" 
              onclick='window.openProcessModal(${JSON.stringify(p)})' 
              title="Editar"><i class="fas fa-edit"></i></button>
          <button class="btn btn-primary" style="padding:4px; width:28px; height:28px" 
              onclick='window.showHistory(${JSON.stringify(p)})' 
              title="Histórico"><i class="fas fa-history"></i></button>
          <button class="btn btn-danger" style="padding:4px; width:28px; height:28px" 
              onclick="window.deleteProcess('${p.id}')" 
              title="Excluir"><i class="fas fa-trash"></i></button>
      </div>
  </td>
  ```

### Modern Implementation (index.html with data-action attributes)
- **Lines 6317-6327**: Alternative implementation using data attributes
  ```javascript
  <td style="display:flex; flex-direction: row; gap:4px; align-items:center;">
      <button class="btn btn-warning action-btn" data-action="edit" data-id="${p.id}" 
          title="Editar" style="padding:4px; width:28px; height:28px">
          <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-primary action-btn" data-action="history" data-id="${p.id}" 
          title="Histórico" style="padding:4px; width:28px; height:28px">
          <i class="fas fa-history"></i>
      </button>
      <button class="btn btn-danger action-btn" data-action="delete" data-id="${p.id}" 
          title="Excluir" style="padding:4px; width:28px; height:28px">
          <i class="fas fa-trash"></i>
      </button>
  </td>
  ```

---

## 2. EDIT MODAL STRUCTURE - processControlModal

### HTML Modal Definition
- **File**: E:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html
- **Lines 4345-4572**: Complete modal structure
  
  Key sections:
  
  **Modal Container (Lines 4345-4356)**:
  ```html
  <div id="processControlModal" class="process-modal"
      onclick="if(event.target===this) window.closeModal('processControlModal')">
      <div class="process-modal-content">
          <header class="modal-header">
              <div class="modal-header-info">
                  <h2 id="processModalTitle">Novo Processo</h2>
                  <p>Cadastro de processo administrativo para controle de fluxo</p>
              </div>
              <button type="button" class="modal-close" 
                  onclick="window.closeModal('processControlModal')"
                  title="Fechar">
                  <i class="fas fa-times"></i>
              </button>
          </header>
  ```
  
  **Form Body (Lines 4359-4563)**:
  - Section 1: IDENTIFICAÇÃO DO PROCESSO (4407-4435)
  - Section 2: INFORMAÇÕES DO PROCESSO (4437-4468)
  - Section 3: PRAZOS E DATAS (4470-4489)
  - Section 4: HISTÓRICO / TIMELINE (Contains modalTimeline container)
  - Section 5: SITUAÇÃO ATUAL (4541-4550)
  - Section 6: INFORMAÇÕES ADICIONAIS (4552-4562)
  
  **Timeline Container (Lines 4536-4538)**:
  ```html
  <div id="modalTimeline" class="modal-timeline">
      <!-- Timeline items here -->
  </div>
  ```
  
  **Footer (Lines 4565-4569)**:
  ```html
  <footer class="modal-footer">
      <button type="button" class="btn-glass-cancel"
          onclick="window.closeModal('processControlModal')">Cancelar</button>
      <button type="submit" class="btn-navy-save">Salvar Processo</button>
  </footer>
  ```

### Modal Opening Function
- **File**: E:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\2026_script.js
- **Lines 725-763**: Function `openProcessModal(p = null)`
  ```javascript
  window.openProcessModal = function (p = null) {
      const form = document.getElementById('processForm');
      if (!form) return;
      form.reset(); window.updateSelects();
      window._tempHistory = [];
      
      // ... form field population ...
      
      if (p) {
          document.getElementById('processModalTitle').innerText = 'Editar Processo';
          document.getElementById('processId').value = p.id;
          // ... populate all fields ...
          window.renderModalHistory(p.history);
          window.updateModalRemainingDays();
      } else {
          document.getElementById('processModalTitle').innerText = 'Novo Processo';
          document.getElementById('processId').value = '';
          // ... initialize new process ...
          window.renderModalHistory([]);
      }
      document.getElementById('processControlModal').style.display = 'flex';
  };
  ```

### Modal Closing
- **File**: E:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\2026_script.js
- **Lines 27-70**: Function `closeAllModals()` includes 'processControlModal'
  ```javascript
  var ids = [
      'accessibility-modal', 'cookie-modal', 
      'processControlModal', 'processConfigModal', 'processHistoryModal', 
      // ... other modals ...
  ];
  ```

---

## 3. PROCESS HISTORY / TIMELINE RENDERING

### Historical Modal (processHistoryModal)
- **File**: E:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html
- **Lines 4967-4986**: Modal HTML structure
  ```html
  <div id="processHistoryModal" class="process-modal"
      onclick="if(event.target===this) window.closeModal('processHistoryModal')">
      <div class="process-modal-content">
          <header class="modal-header">
              <div class="modal-header-info">
                  <h2 style="color:#1452B5;">
                      <i class="fas fa-history"></i> Histórico de Tramitação
                  </h2>
                  <p id="historyProcessSummary">Rastreabilidade completa do processo administrativo</p>
              </div>
              <button type="button" class="modal-close"
                  onclick="window.closeModal('processHistoryModal')">&times;</button>
          </header>
          <div class="history-container" id="historyTimeline">
              <!-- Items will be rendered here -->
          </div>
          <footer class="modal-footer">
              <button type="button" class="btn-action btn-secondary"
                  onclick="window.closeModal('processHistoryModal')">Fechar Histórico</button>
          </footer>
      </div>
  </div>
  ```

### Timeline Rendering Functions
- **File**: E:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\2026_script.js

**1. renderModalHistory() - Lines 765-775** (renders in modalTimeline):
  ```javascript
  window.renderModalHistory = function (history = []) {
      const cont = document.getElementById('modalTimeline');
      if (!cont) return;
      cont.innerHTML = history.length ? '' : '<p style="text-align:center; color:#888; font-size:12px;">Sem histórico.</p>';
      [...history].reverse().forEach(h => {
          const div = document.createElement('div');
          div.className = 'modal-timeline-item';
          div.innerHTML = `<span class="modal-timeline-date">${h.date}</span><div class="modal-timeline-content">${h.from ? `${h.from} &rarr; ${h.to}` : h.msg || h.message}</div>`;
          cont.appendChild(div);
      });
  };
  ```

**2. showHistory() - Lines 821-834** (renders processHistoryModal):
  ```javascript
  window.showHistory = function (p) {
      const timeline = document.getElementById('historyTimeline');
      const sym = document.getElementById('historyProcessSummary');
      if (!timeline || !sym) return;
      sym.innerHTML = `Processo: <strong>${p.ppAno}</strong>`;
      timeline.innerHTML = '';
      [...p.history].reverse().forEach(h => {
      
