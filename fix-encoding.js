const fs = require('fs');

const path = "H:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html";

let content = fs.readFileSync(path, 'utf8');

// Substituições de caracteres double-encoded UTF-8
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
    ['BrasÃ£o', 'Brasão'],
    ['ItaguaÃ­', 'Itaguaí'],
    ['EducaÃ§Ã£o', 'Educação'],
    ['gestÃ£o', 'gestão'],
];

replacements.forEach(([old, newChar]) => {
    content = content.split(old).join(newChar);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Correções de encoding aplicadas com sucesso!');
