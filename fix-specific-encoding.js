const fs = require('fs');

const path = "H:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html";

let content = fs.readFileSync(path, 'utf8');

const replacements = [
    ['SocietÃ¡ria', 'Societária'],
    ['MobiliÃ¡rios', 'Mobiliários'],
    ['previdenciÃ¡rias', 'previdenciárias'],
    ['ContÃ¡bil', 'Contábil'],
    ['DiÃ¡rio', 'Diário'],
    ['Ã\u00A0', 'à'],
    ['tributÃ¡rias', 'tributárias'],
    ['Ã¡', 'á'],
    ['BrasÃ£o', 'Brasão'],
    ['EducaÃ§Ã£o', 'Educação'],
    ['gestÃ£o', 'gestão'],
    ['ItaguaÃ­', 'Itaguaí'],
];

replacements.forEach(([old, newChar]) => {
    content = content.split(old).join(newChar);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Correções de encoding específicas aplicadas!');
