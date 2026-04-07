const fs = require('fs');

const path = "H:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\2026_script.js";

let content = fs.readFileSync(path, 'utf8');

const replacements = [
    ['Ã§', 'ç'],
    ['Ã£', 'ã'],
    ['Ã©', 'é'],
    ['Ã³', 'ó'],
    ['Ã­', 'í'],
    ['Ãº', 'ú'],
    ['Ã¢', 'â'],
    ['Ãª', 'ê'],
    ['Ã´', 'ô'],
    ['Ãµ', 'õ'],
    ['â€¢', '•'],
    ['â€™', "'"],
    ['â€œ', '"'],
    ['â€', '"'],
    ['â€�', '"'],
    ['â€', '"'],
];

replacements.forEach(([old, newChar]) => {
    content = content.split(old).join(newChar);
});

fs.writeFileSync(path, content, 'utf8');
console.log('2026_script.js - Correções de encoding aplicadas!');
