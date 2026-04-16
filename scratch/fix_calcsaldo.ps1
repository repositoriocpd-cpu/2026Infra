$file = "e:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# ---- 1) Substituir lancOnNovoEmpenhoChange (remover referencia ao campo removido) ----
$oldNovo = "window.lancOnNovoEmpenhoChange = function (select) {
            const opt = select.options[select.selectedIndex];
            const row = select.closest('.lanc-empenho-row');
            row.querySelector('.lanc-valor-empenho').value = opt && opt.value ? parseFloat(opt.getAttribute('data-valor')).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
            window.lancCalcSaldo();
        };"

$newNovo = "window.lancOnNovoEmpenhoChange = function (select) {
            window.lancCalcSaldo();
        };"

$content = $content.Replace($oldNovo, $newNovo)
Write-Host "lancOnNovoEmpenhoChange substituido: $($content.Contains($newNovo))"

# ---- 2) Substituir lancCalcSaldo completo ----
$oldCalc = "window.lancCalcSaldo = function () {
            const valorNf = parseFloat(document.getElementById('lanc-valor-nf').value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
            let totalEmpenhos = 0;
            document.querySelectorAll('.lanc-valor-empenho').forEach(el => { totalEmpenhos += parseFloat(el.value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0; });
            const infoBox = document.getElementById('lanc-empenho-info');
            if (totalEmpenhos > 0) {
                infoBox.style.display = 'flex';
                document.getElementById('lanc-empenho-info-txt').innerHTML = `<strong>Total:</strong> R$ ${totalEmpenhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | <strong>NF:</strong> R$ ${valorNf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | <strong>Saldo:</strong> R$ ${(totalEmpenhos - valorNf).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            } else infoBox.style.display = 'none';
        };"

$newCalc = "window.lancCalcSaldo = function () {
            const valorNf = parseFloat((document.getElementById('lanc-valor-nf') || {value:''}).value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
            let totalEmpenhos = 0;
            document.querySelectorAll('.lanc-empenho-select').forEach(function(sel) {
                const opt = sel.options[sel.selectedIndex];
                if (opt && opt.value) {
                    const val = parseFloat(opt.getAttribute('data-valor') || '0') || 0;
                    totalEmpenhos += val;
                }
            });
            const saldo = totalEmpenhos - valorNf;
            const infoBox = document.getElementById('lanc-empenho-info');
            const infoTxt = document.getElementById('lanc-empenho-info-txt');
            if (totalEmpenhos > 0 || valorNf > 0) {
                if (infoBox) infoBox.style.display = 'flex';
                if (infoTxt) infoTxt.innerHTML = '<strong>Empenho:</strong> R$ ' + totalEmpenhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' | <strong>NF:</strong> R$ ' + valorNf.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' | <strong>Saldo:</strong> R$ ' + saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, style: undefined });
            } else {
                if (infoBox) infoBox.style.display = 'none';
            }
        };"

if ($content.Contains($oldCalc)) {
    $content = $content.Replace($oldCalc, $newCalc)
    Write-Host "lancCalcSaldo substituido com sucesso!"
} else {
    Write-Host "AVISO: lancCalcSaldo nao encontrado exatamente - verificar manualmente"
}

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "Arquivo salvo."