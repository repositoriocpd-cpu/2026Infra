$file = "e:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# 1) Consertar lancAdicionarEmpenho - remover money-wrap do innerHTML dinamico
$idx = $content.IndexOf("div.innerHTML = ``<select class=`"lanc-empenho-select")
Write-Host "idx lancAdicionarEmpenho innerHTML: $idx"
if ($idx -ge 0) {
    $end = $content.IndexOf("`;", $idx)
    $oldLine = $content.Substring($idx, $end - $idx + 2)
    Write-Host "Linha antiga: $oldLine"
}

# 2) Ver lancCalcSaldo
$idx2 = $content.IndexOf("querySelectorAll")
$trecho2 = $content.Substring([Math]::Max(0,$idx2-20), 300)
Write-Host "=== lancCalcSaldo trecho ==="
Write-Host $trecho2