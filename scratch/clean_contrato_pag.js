const fs = require('fs');
const file = 'e:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html';
let c = fs.readFileSync(file, 'utf8');

// Checar quantas ocorrencias restam
const count = (c.match(/lanc-contrato-pag/g) || []).length;
console.log('Ocorrências lanc-contrato-pag restantes:', count);

// 1) Remover o comentário HTML residual
c = c.replace('<!-- Campo N.º Contrato (vinculado ao empenho) -->\n\n                                  ', '');

// 2) Limpar lancOnEmpresaChange: remover referência a lanc-contrato-pag
const oldEmp = `            const selContratoPag = document.getElementById('lanc-contrato-pag');
            const emptyOpt = '<option value="">-- Selecione a Empresa primeiro --</option>';
            if (!empresa) {
                if (selContrato) { selContrato.innerHTML = emptyOpt; selContrato.disabled = true; }
                if (selContratoPag) { selContratoPag.innerHTML = emptyOpt; selContratoPag.disabled = true; }
                return;
            }
            const contratos = window.fiscalData.contratos.filter(c => c.supplier_name === empresa);
            const opts = '<option value="">-- Selecione --</option>' + contratos.map(c => \`<option value="\${c.contract_number}">\${c.contract_number}</option>\`).join('');
            if (selContrato) { selContrato.innerHTML = opts; selContrato.disabled = false; }
            if (selContratoPag) { selContratoPag.innerHTML = opts; selContratoPag.disabled = false; }`;

const newEmp = `            if (!empresa) {
                if (selContrato) { selContrato.innerHTML = '<option value="">-- Selecione a Empresa primeiro --</option>'; selContrato.disabled = true; }
                return;
            }
            const contratos = window.fiscalData.contratos.filter(c => c.supplier_name === empresa);
            const opts = '<option value="">-- Selecione --</option>' + contratos.map(c => \`<option value="\${c.contract_number}">\${c.contract_number}</option>\`).join('');
            if (selContrato) { selContrato.innerHTML = opts; selContrato.disabled = false; }`;

if (c.includes(oldEmp)) {
    c = c.replace(oldEmp, newEmp);
    console.log('✓ lancOnEmpresaChange limpo');
} else {
    console.log('⚠ lancOnEmpresaChange trecho não encontrado exatamente');
}

// 3) Remover lancOnContratoPagChange completo
const oldPagChange = `\n        window.lancOnContratoPagChange = function () {\n            // Sincroniza seleção com o select original e atualiza empenhos\n            const selPag = document.getElementById('lanc-contrato-pag');\n            const selOrig = document.getElementById('lanc-contrato');\n            if (selOrig && selPag) selOrig.value = selPag.value;\n            window.lancAtualizarTodosEmpenhosSelects();\n        };`;
if (c.includes(oldPagChange)) {
    c = c.replace(oldPagChange, '');
    console.log('✓ lancOnContratoPagChange removido');
} else {
    console.log('⚠ lancOnContratoPagChange não encontrado');
}

// 4) Limpar lancAtualizarTodosEmpenhosSelects: remover referência a lanc-contrato-pag
const oldTodos = `            const selPag = document.getElementById('lanc-contrato-pag');
            const contrato = (selPag && selPag.value) || (document.getElementById('lanc-contrato') || {value:''}).value;`;
const newTodos = `            const contrato = (document.getElementById('lanc-contrato') || {value:''}).value;`;
if (c.includes(oldTodos)) {
    c = c.replace(oldTodos, newTodos);
    console.log('✓ lancAtualizarTodosEmpenhosSelects limpo');
} else {
    console.log('⚠ lancAtualizarTodosEmpenhosSelects trecho não encontrado');
}

// Verificação final
const remaining = (c.match(/lanc-contrato-pag/g) || []).length;
console.log('Ocorrências restantes após limpeza:', remaining);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ Arquivo salvo!');
