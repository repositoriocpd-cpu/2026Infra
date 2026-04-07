const fs = require('fs');

const path = "H:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html";

let content = fs.readFileSync(path, 'utf8');

// Correções específicas para os padrões mencionados
const replacements = [
    // Padrões específicos mencionados
    ['IDENTIFICAÃ‡ÃƒO', 'IDENTIFICAÇÃO'],
    ['NÂº PROC. MÃƒE', 'Nº PROC. MÃE'],
    ['NÃºMERO DO P.P.', 'NÚMERO DO P.P.'],
    ['ANO EXERCÃCIO', 'ANO EXERCÍCIO'],
    ['INFORMAÃ‡Ã•ES', 'INFORMAÇÕES'],
    ['DATA DE CONCLUSÃƒO', 'DATA DE CONCLUSÃO'],
    ['NOVA ATUALIZAÃ‡ÃƒO', 'NOVA ATUALIZAÇÃO'],
    ['TRAMITAÃ‡ÃƒO', 'TRAMITAÇÃO'],
    ['SITUAã‡ãƒO', 'SITUAÇÃO'],
    
    // Padrões de 3-4 caracteres que são double-encoded
    ['Ã‡ÃƒO', 'ÇÃO'],
    ['Ã‡ÃƒO', 'ÇÃO'],
    ['ÃƒO', 'ÃO'],
    ['ÃƒO', 'ÃO'],
    ['Ã‰', 'É'],
    ['Ã“', 'Ó'],
    ['Ãš', 'Ú'],
    ['Ã', 'Ã'],
    ['Ã', 'Ã'],
    ['Âº', 'º'],
    ['Ã', 'ã'],
    
    // Padrões NÂ, NÃ etc
    ['NÂº', 'Nº'],
    ['NÃƒE', 'NÃO'],
    ['NÃƒO', 'NÃO'],
    ['NÃ‰', 'NÉ'],
    ['NÃš', 'NÚ'],
    ['NÃ', 'NÃ'],
    
    // Limpeza final
    ['Ã‡ÃƒO', 'ÇÃO'],
    ['ÃƒO', 'ÃO'],
    ['Ã‰', 'É'],
    ['Ã“', 'Ó'],
    ['Ãš', 'Ú'],
];

replacements.forEach(([old, newChar]) => {
    content = content.split(old).join(newChar);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Correções específicas aplicadas!');

// Verificação
const patterns = ['Ã‡Ã', 'ÃƒO', 'NÂ', 'NÃƒ', 'EXERCÃ', 'CONCLUSÃ', 'TRAMITAÃ'];
let found = false;
patterns.forEach(p => {
    if (content.includes(p)) {
        console.log(`Ainda encontrado: "${p}"`);
        found = true;
    }
});
if (!found) console.log('Todos os padrões verificados foram corrigidos!');
