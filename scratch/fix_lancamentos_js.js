const fs = require('fs');
const file = 'e:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html';
let content = fs.readFileSync(file, 'utf8');

// ---- 1) Patch lancOnEmpresaChange: sincronizar lanc-contrato-pag também ----
const oldEmpresaChange = `window.lancOnEmpresaChange = function () {
            const empresa = document.getElementById('lanc-empresa').value;
            const selContrato = document.getElementById('lanc-contrato');
            if (!empresa) { selContrato.innerHTML = '<option value="">-- Selecione --</option>'; selContrato.disabled = true; return; }
            const contratos = window.fiscalData.contratos.filter(c => c.supplier_name === empresa);
            selContrato.innerHTML = '<option value="">-- Selecione --</option>' + contratos.map(c => \`<option value="\${c.contract_number}">\${c.contract_number}</option>\`).join('');
            selContrato.disabled = false;
            window.lancAtualizarTodosEmpenhosSelects();
        };`;

const newEmpresaChange = `window.lancOnEmpresaChange = function () {
            const empresa = document.getElementById('lanc-empresa').value;
            const selContrato = document.getElementById('lanc-contrato');
            const selContratoPag = document.getElementById('lanc-contrato-pag');
            const emptyOpt = '<option value="">-- Selecione a Empresa primeiro --</option>';
            if (!empresa) {
                if (selContrato) { selContrato.innerHTML = emptyOpt; selContrato.disabled = true; }
                if (selContratoPag) { selContratoPag.innerHTML = emptyOpt; selContratoPag.disabled = true; }
                return;
            }
            const contratos = window.fiscalData.contratos.filter(c => c.supplier_name === empresa);
            const opts = '<option value="">-- Selecione --</option>' + contratos.map(c => \`<option value="\${c.contract_number}">\${c.contract_number}</option>\`).join('');
            if (selContrato) { selContrato.innerHTML = opts; selContrato.disabled = false; }
            if (selContratoPag) { selContratoPag.innerHTML = opts; selContratoPag.disabled = false; }
            window.lancAtualizarTodosEmpenhosSelects();
        };

        window.lancOnContratoPagChange = function () {
            // Sincroniza seleção com o select original e atualiza empenhos
            const selPag = document.getElementById('lanc-contrato-pag');
            const selOrig = document.getElementById('lanc-contrato');
            if (selOrig && selPag) selOrig.value = selPag.value;
            window.lancAtualizarTodosEmpenhosSelects();
        };

        window.lancAdicionarNF = function () {
            const nf = (document.getElementById('lanc-nf') || {value:''}).value.trim();
            const valor = (document.getElementById('lanc-valor-nf') || {value:''}).value.trim();
            if (!nf) { alert('Preencha o N.º da Nota Fiscal antes de adicionar.'); return; }
            // Feedback visual: flash verde no campo
            const nfEl = document.getElementById('lanc-nf');
            if (nfEl) { nfEl.style.borderColor = '#22c55e'; setTimeout(() => { nfEl.style.borderColor = ''; }, 1200); }
            window.lancCalcSaldo();
        };`;

if (content.includes(oldEmpresaChange)) {
    content = content.replace(oldEmpresaChange, newEmpresaChange);
    console.log('✓ lancOnEmpresaChange atualizado com sincronização do select duplo');
} else {
    console.log('⚠ lancOnEmpresaChange não encontrado exatamente');
    const idx = content.indexOf('window.lancOnEmpresaChange = function ()');
    if (idx >= 0) console.log('  Snippet atual:', content.substring(idx, idx+300));
}

// ---- 2) Patch lancAtualizarTodosEmpenhosSelects: usar lanc-contrato-pag quando disponível ----
const oldTodos = `window.lancAtualizarTodosEmpenhosSelects = function () {
            const empresa = document.getElementById('lanc-empresa').value;
            const contrato = document.getElementById('lanc-contrato').value;`;

const newTodos = `window.lancAtualizarTodosEmpenhosSelects = function () {
            const empresa = document.getElementById('lanc-empresa').value;
            const selPag = document.getElementById('lanc-contrato-pag');
            const contrato = (selPag && selPag.value) || (document.getElementById('lanc-contrato') || {value:''}).value;`;

if (content.includes(oldTodos)) {
    content = content.replace(oldTodos, newTodos);
    console.log('✓ lancAtualizarTodosEmpenhosSelects atualizado');
} else {
    console.log('⚠ lancAtualizarTodosEmpenhosSelects não encontrado exatamente');
}

fs.writeFileSync(file, content, 'utf8');
console.log('✓ Arquivo salvo!');
