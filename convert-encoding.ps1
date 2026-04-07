$path = "H:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html"
$content = Get-Content $path -Raw -Encoding UTF8
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8)
Write-Host "Convertido com sucesso"
