const fs = require('fs');

const path = "H:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html";

let content = fs.readFileSync(path, 'utf8');

// Correções de encoding - incluindo os padrões problemáticos
const replacements = [
    // Padrões commonente errados
    ['NÂº', 'Nº'],
    ['NÃº', 'Nº'],
    ['NÃƒE', 'NÃO'],
    ['NÃƒ', 'NÃ'],
    ['NÃ‰', 'NÉ'],
    ['NÃš', 'NÚ'],
    ['NÃƒO', 'NÃO'],
    ['NÃ‰', 'NÉ'],
    ['NÃš', 'NÚ'],
    ['NÃƒ', 'NÃ'],
    ['DENTRO DA VALIDADE', 'DENTRO DA VALIDADE'],
    ['DENTRO DA VALIDADE', 'DENTRO DA VALIDADE'],
    // Caracteres comuns
    ['Ã', 'ã'],
    ['Ã', 'ó'],
    ['Ã', 'í'],
    ['Ã', 'ú'],
    ['Ã', 'à'],
    ['Ã', 'è'],
    ['Ã', 'ì'],
    ['Ã', 'ò'],
    ['Ã', 'ù'],
    ['Ã', 'Á'],
    ['Ã', 'É'],
    ['Ã', 'Í'],
    ['Ã', 'Ó'],
    ['Ã', 'Ú'],
    ['Ã', 'À'],
    ['Ã', 'È'],
    ['Ã', 'Ì'],
    ['Ã', 'Ò'],
    ['Ã', 'Ù'],
    ['Ã', 'Â'],
    ['Ã', 'Ê'],
    ['Ã', 'Î'],
    ['Ã', 'Ô'],
    ['Ã', 'Û'],
    ['Ã', 'Ã'],
    ['Ã', 'Õ'],
    ['Ã', 'Ç'],
    ['SocietÃ¡ria', 'Societária'],
    ['MobiliÃ¡rios', 'Mobiliários'],
    ['previdenciÃ¡rias', 'previdenciárias'],
    ['ContÃ¡bil', 'Contábil'],
    ['DiÃ¡rio', 'Diário'],
    ['tributÃ¡rias', 'tributárias'],
    ['BrasÃ£o', 'Brasão'],
    ['EducaÃ§Ã£o', 'Educação'],
    ['gestÃ£o', 'gestão'],
    ['ItaguaÃ­', 'Itaguaí'],
    ['BrasÃ£o', 'Brasão'],
    ['EducaÃ§Ã£o', 'Educação'],
    ['gestÃ£o', 'gestão'],
    ['ItaguaÃ­', 'Itaguaí'],
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
];

replacements.forEach(([old, newChar]) => {
    content = content.split(old).join(newChar);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Correções de encoding abrangentes aplicadas!');

// Verificar padrões restantes
const patterns = ['NÂ', 'Ãƒ', 'Ã¢', 'Ã©'];
patterns.forEach(p => {
    if (content.includes(p)) {
        console.log(`ATENÇÃO: Ainda contém "${p}"`);
    }
});
console.log('Verificação concluída!');
