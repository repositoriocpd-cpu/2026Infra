const fs = require('fs');
const path = require('path');

const file = 'e:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html';
let content = fs.readFileSync(file, 'utf8');

// ---- 1) Simplificar lancOnNovoEmpenhoChange (campo valor foi removido) ----
const oldNovo = `window.lancOnNovoEmpenhoChange = function (select) {
            const opt = select.options[select.selectedIndex];
            const row = select.closest('.lanc-empenho-row');
            row.querySelector('.lanc-valor-empenho').value = opt && opt.value ? parseFloat(opt.getAttribute('data-valor')).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
            window.lancCalcSaldo();
        };`;

const newNovo = `window.lancOnNovoEmpenhoChange = function (select) {
            window.lancCalcSaldo();
        };`;

if (content.includes(oldNovo)) {
    content = content.replace(oldNovo, newNovo);
    console.log('✓ lancOnNovoEmpenhoChange atualizado');
} else {
    console.log('⚠ lancOnNovoEmpenhoChange não encontrado exatamente');
}

// ---- 2) Substituir lancCalcSaldo: usar data-valor do select, calcular Saldo = Empenho - NF ----
const oldCalcStart = `window.lancCalcSaldo = function () {
            const valorNf = parseFloat(document.getElementById('lanc-valor-nf').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
            let totalEmpenhos = 0;
            document.querySelectorAll('.lanc-valor-empenho').forEach(el => { totalEmpenhos += parseFloat(el.value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0; });
            const infoBox = document.getElementById('lanc-empenho-info');
            if (totalEmpenhos > 0) {
                infoBox.style.display = 'flex';
                document.getElementById('lanc-empenho-info-txt').innerHTML = \`<strong>Total:</strong> R$ \${totalEmpenhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | <strong>NF:</strong> R$ \${valorNf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | <strong>Saldo:</strong> R$ \${(totalEmpenhos - valorNf).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\`;
            } else infoBox.style.display = 'none';
        };`;

const newCalc = `window.lancCalcSaldo = function () {
            const elNf = document.getElementById('lanc-valor-nf');
            const valorNf = elNf ? (parseFloat(elNf.value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0) : 0;
            let totalEmpenhos = 0;
            document.querySelectorAll('.lanc-empenho-select').forEach(function(sel) {
                const opt = sel.options[sel.selectedIndex];
                if (opt && opt.value) {
                    totalEmpenhos += parseFloat(opt.getAttribute('data-valor') || '0') || 0;
                }
            });
            const saldo = totalEmpenhos - valorNf;
            const infoBox = document.getElementById('lanc-empenho-info');
            const infoTxt = document.getElementById('lanc-empenho-info-txt');
            if (totalEmpenhos > 0 || valorNf > 0) {
                if (infoBox) infoBox.style.display = 'flex';
                if (infoTxt) infoTxt.innerHTML =
                    '<strong>Empenho:</strong> R$ ' + totalEmpenhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) +
                    ' \u2502 <strong>NF:</strong> R$ ' + valorNf.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) +
                    ' \u2502 <strong>Saldo:</strong> R$ ' + saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            } else {
                if (infoBox) infoBox.style.display = 'none';
            }
        };`;

if (content.includes(oldCalcStart)) {
    content = content.replace(oldCalcStart, newCalc);
    console.log('✓ lancCalcSaldo atualizado com nova logica');
} else {
    console.log('⚠ lancCalcSaldo nao encontrado exatamente - verificar');
    // Log snippets to debug
    const idx = content.indexOf('window.lancCalcSaldo = function');
    if (idx >= 0) console.log('  Trecho atual:', content.substring(idx, idx + 200));
}

// ---- 3) Garantir que lancOnEmpenhoChange (select inicial) dispara lancCalcSaldo ----
// O select inicial usa onchange="window.lancOnEmpenhoChange()" - verificar se chama calcSaldo
const idxOnEmp = content.indexOf('window.lancOnEmpenhoChange = function ()');
if (idxOnEmp >= 0) {
    const snippet = content.substring(idxOnEmp, idxOnEmp + 300);
    console.log('lancOnEmpenhoChange atual:', snippet);
}

fs.writeFileSync(file, content, 'utf8');
console.log('✓ Arquivo salvo com sucesso!');
