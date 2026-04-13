$file = 'e:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

$hasCRLF = $content.Contains("`r`n")
Write-Host "Has CRLF: $hasCRLF"
Write-Host "File length chars: $($content.Length)"

# Find empenhos line
$idx = $content.IndexOf("switchFiscalTab('empenhos'")
if ($idx -ge 0) {
    Write-Host "Found empenhos at char index: $idx"
    Write-Host "Context: $($content.Substring([Math]::Max(0,$idx-50), 200))"
} else {
    Write-Host "NOT FOUND: switchFiscalTab('empenhos'"
    # Try single quotes
    $idx2 = $content.IndexOf('switchFiscalTab')
    Write-Host "switchFiscalTab found at: $idx2"
    if ($idx2 -ge 0) {
        Write-Host "Context: $($content.Substring($idx2, 100))"
    }
}

# Check if lancamentos already exists
$lancExists = $content.Contains('fiscal-tab-lancamentos')
Write-Host "lancamentos tab exists: $lancExists"
