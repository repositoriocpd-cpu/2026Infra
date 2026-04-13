$file = 'e:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# Get more context around the empenhos button to see exact whitespace
$idx = $content.IndexOf("switchFiscalTab('empenhos'")
$snippet = $content.Substring($idx, 500)
Write-Host "=== RAW SNIPPET (showing special chars) ==="
# Show it with visible special chars
$snippet | ForEach-Object {
    $_ -replace "`r", '[CR]' -replace "`n", '[LF]`n'
}
Write-Host "=== END ==="
