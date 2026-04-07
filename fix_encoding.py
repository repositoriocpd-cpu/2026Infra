# -*- coding: utf-8 -*-
import re

path = r"H:\2026 SISTEMAS\2025 Infra Sistemas YASMIN\index.html"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Substituições de caracteres double-encoded UTF-8
replacements = {
    'Ã§': 'ç',
    'Ã£': 'ã',
    'Ã©': 'é',
    'Ã³': 'ó',
    'Ã­': 'í',
    'Ãº': 'ú',
    'Ã¢': 'â',
    'Ãª': 'ê',
    'Ã´': 'ô',
    'Ãµ': 'õ',
    'Ã': 'ã',
    'Ã': 'ó',
    'Ã': 'í',
    'Ã': 'ú',
    'Ã': 'à',
    'â€¢': '•',
    'â€™': "'",
    'â€œ': '"',
    'â€': '"',
    'â€�': '"',
    'â€': '"',
    'Ã\u0080': 'À',
    'Ã\u0081': 'Á',
    'Ã\u0082': 'Â',
    'Ã\u0083': 'Ã',
    'Ã\u0084': 'Ä',
    'Ã\u0085': 'Å',
    'Ã\u0086': 'Æ',
    'Ã\u0087': 'Ç',
    'Ã\u0088': 'È',
    'Ã\u0089': 'É',
    'Ã\u008a': 'Ê',
    'Ã\u008b': 'Ë',
    'Ã\u008c': 'Ì',
    'Ã\u008d': 'Í',
    'Ã\u008e': 'Î',
    'Ã\u008f': 'Ï',
    'Ã\u0090': 'Ð',
    'Ã\u0091': 'Ñ',
    'Ã\u0092': 'Ò',
    'Ã\u0093': 'Ó',
    'Ã\u0094': 'Ô',
    'Ã\u0095': 'Õ',
    'Ã\u0096': 'Ö',
    'Ã\u0097': '×',
    'Ã\u0098': 'Ø',
    'Ã\u0099': 'Ù',
    'Ã\u009a': 'Ú',
    'Ã\u009b': 'Û',
    'Ã\u009c': 'Ü',
    'Ã\u009d': 'Ý',
    'Ã\u009e': 'Þ',
    'Ã\u009f': 'ß',
}

for key, value in replacements.items():
    content = content.replace(key, value)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Correções de encoding aplicadas com sucesso!")
