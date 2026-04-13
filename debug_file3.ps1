$file = 'e:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html'
$enc = [System.Text.Encoding]::UTF8
$content = [System.IO.File]::ReadAllText($file, $enc)

# Find gerarrelatorio-resultado and show 400 chars after it
$idx = $content.IndexOf("relatorio-resultado")
if ($idx -ge 0) {
    $snippet = $content.Substring($idx, 500)
    Write-Host "=== AFTER relatorio-resultado ==="
    $snippet -replace "`r", '[CR]' -replace "`n", '[LF]`n'
    Write-Host "==="
} else {
    Write-Host "relatorio-resultado NOT FOUND"
}

# Also check what's around lancamentos in context
$hasLanc = $content.Contains('fiscal-tab-lancamentos')
Write-Host "fiscal-tab-lancamentos exists: $hasLanc"
$hasJS = $content.Contains('lancPopularEmpresas')
Write-Host "lancPopularEmpresas exists: $hasJS"
