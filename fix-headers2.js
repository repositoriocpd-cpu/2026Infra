const fs = require('fs');

const path = "H:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html";

let content = fs.readFileSync(path, 'utf8');

// Converter de volta para buffer para manipular bytes
const buffer = Buffer.from(content, 'utf8');
let str = content;

// Padrões de bytes problemáticos (UTF-8 mal decodificado)
// Ã§ = 0xC3 0xA7 -> ç
// Ã = 0xC3 0x83 -> Ã
// Ã = 0xC3 0xA3 -> ã
// O = 0xC3 0x93 -> Ó

// Correções usando regex para padrões específicos
str = str.replace(/ã‡ãƒO/g, 'ÇÃO');
str = str.replace(/IDENTIFICAã‡ãƒO/g, 'IDENTIFICAÇÃO');
str = str.replace(/SITUAã‡ãƒO/g, 'SITUAÇÃO');
str = str.replace(/NÂº PROC\. MÃƒE/g, 'Nº PROC. MÃE');
str = str.replace(/NÃºMERO DO P\.P\./g, 'NÚMERO DO P.P.');
str = str.replace(/ANO EXERCÃCIO/g, 'ANO EXERCÍCIO');
str = str.replace(/INFORMAã‡ã•ES/g, 'INFORMAÇÕES');
str = str.replace(/DATA DE CONCLUSÃƒO/g, 'DATA DE CONCLUSÃO');
str = str.replace(/NOVA ATUALIZAã‡ãƒO/g, 'NOVA ATUALIZAÇÃO');
str = str.replace(/TRAMITAã‡ãƒO/g, 'TRAMITAÇÃO');
str = str.replace(/sITUAã‡ãƒO/g, 'SITUAÇÃO');
str = str.replace(/CONCLUSÃƒO/g, 'CONCLUSÃO');
str = str.replace(/TRAMITAã‡ãƒO/g, 'TRAMITAÇÃO');

// Padrões genéricos restantes
str = str.replace(/Ã‡ÃƒO/g, 'ÇÃO');
str = str.replace(/ã‡ãƒO/g, 'ÇÃO');
str = str.replace(/ã‡ã•O/g, 'ÇÃO');
str = str.replace(/ÃƒO/g, 'ÃO');
str = str.replace(/ã‡ãƒO/g, 'ÇÃO');
str = str.replace(/ÃƒO/g, 'ÃO');

fs.writeFileSync(path, str, 'utf8');
console.log('Correções específicas de headers aplicadas!');

// Verificação
const patterns = ['ã‡ãƒO', 'ã‡ã', 'Ã‡ÃƒO', 'IDENTIFICAã'];
let found = false;
patterns.forEach(p => {
    if (str.includes(p)) {
        console.log(`Ainda encontrado: "${p}"`);
        found = true;
    }
});
if (!found) console.log('Todos os padrões verificados foram corrigidos!');
