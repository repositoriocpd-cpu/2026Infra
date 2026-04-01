$path = "H:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html"
$content = Get-Content $path -Raw -Encoding UTF8

# Substituições de caracteres double-encoded UTF-8
$replacements = @{
    [char]0x00E7 + "" = "ç"  # Ã§ -> ç
    "Ã§" = "ç"
    "Ã£" = "ã"
    "Ã©" = "é"
    "Ã³" = "ó"
    "Ã­" = "í"
    "Ãº" = "ú"
    "Ã¢" = "â"
    "Ãª" = "ê"
    "Ã" = "ã"
    "Ãµ" = "õ"
    "Ã" = "ã"
    "Ã" = "ó"
    "â€¢" = "•"
    "â€" = ""
    "Ã" = "í"
    "Ã" = "ó"
    "Ã" = "ú"
    "Ã" = "à"
    "Ã" = "è"
    "Ã" = "ì"
    "Ã" = "ò"
    "Ã" = "ù"
    "Ã" = "Á"
    "Ã" = "É"
    "Ã" = "Í"
    "Ã" = "Ó"
    "Ã" = "Ú"
    "Ã" = "À"
    "Ã" = "È"
    "Ã" = "Ì"
    "Ã" = "Ò"
    "Ã" = "Ù"
    "Ã" = "Â"
    "Ã" = "Ê"
    "Ã" = "Î"
    "Ã" = "Ô"
    "Ã" = "Û"
    "Ã" = "Ã"
    "Ã" = "Õ"
    "Ã" = "Ç"
    "â€™" = "'"
    "â€œ" = """
    "â€" = """
    "â€�" = """
    "â€" = """
}

foreach ($key in $replacements.Keys) {
    $content = $content -replace [regex]::Escape($key), $replacements[$key]
}

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8)
Write-Host "Correções aplicadas"
