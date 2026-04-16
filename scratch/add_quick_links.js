const fs = require('fs');
const file = 'e:\\\\2026 SISTEMAS\\\\2025 Infra Sistemas YASMIN\\\\index.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Empresa Fornecedor
const oldEmpresa = '<label style="font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Empresa (Fornecedor)</label>';
const newEmpresa = `<div style="display:flex; justify-content:space-between; align-items:flex-end;">
                                        <label style="font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0;">Empresa (Fornecedor)</label>
                                        <a href="#" onclick="window.lancIrParaAba('fornecedores'); return false;" style="font-size:0.75rem; font-weight:600; color:#0f172a; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#0f172a'">Adicionar Fornecedor</a>
                                      </div>`;

if (content.includes(oldEmpresa)) {
    content = content.replace(oldEmpresa, newEmpresa);
    console.log('✓ Empresa Fornecedor label updated');
} else {
    console.log('⚠ Empresa Fornecedor label not found');
}

// 2. Contrato
const oldContrato = `<label>N.&#186; Contrato</label>
                                      <select id="lanc-contrato"`;
const newContrato = `<div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.3rem;">
                                        <label style="margin-bottom:0;">N.&#186; Contrato</label>
                                        <a href="#" onclick="window.lancIrParaAba('contratos'); return false;" style="font-size:0.75rem; font-weight:600; color:#0f172a; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#0f172a'">Adicionar Contrato</a>
                                      </div>
                                      <select id="lanc-contrato"`;

if (content.includes(oldContrato)) {
    content = content.replace(oldContrato, newContrato);
    console.log('✓ N.º Contrato label updated');
} else {
    console.log('⚠ N.º Contrato label not found');
}

// 3. Empenho
const oldEmpenho = `<label style="font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:0.3rem;">N.&#186; Empenho(s)</label>`;
const newEmpenho = `<div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.3rem;">
                                          <label style="font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:0;">N.&#186; Empenho(s)</label>
                                          <a href="#" onclick="window.lancIrParaAba('empenhos'); return false;" style="font-size:0.75rem; font-weight:600; color:#0f172a; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#0f172a'">Adicionar Empenho</a>
                                        </div>`;

if (content.includes(oldEmpenho)) {
    content = content.replace(oldEmpenho, newEmpenho);
    console.log('✓ N.º Empenho label updated');
} else {
    console.log('⚠ N.º Empenho label not found');
}

// Inject helper JS if not exists
const helperJS = `
        window.lancIrParaAba = function(abaId) {
            let btnIndex = -1;
            if (abaId === 'fornecedores') btnIndex = 0;
            else if (abaId === 'contratos') btnIndex = 3;
            else if (abaId === 'empenhos') btnIndex = 4;
            
            if (btnIndex >= 0) {
                const btns = document.querySelectorAll('.fiscal-tab');
                if (btns.length > btnIndex) {
                    window.switchFiscalTab(abaId, btns[btnIndex]);
                }
            }
        };
`;

if (!content.includes('window.lancIrParaAba = function')) {
    const scriptEnd = content.lastIndexOf('</script>');
    if (scriptEnd !== -1) {
        content = content.substring(0, scriptEnd) + helperJS + content.substring(scriptEnd);
        console.log('✓ Helper function window.lancIrParaAba injected');
    }
}

fs.writeFileSync(file, content, 'utf8');
console.log('All changes applied successfully!');
