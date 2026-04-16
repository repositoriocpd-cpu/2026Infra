const fs = require('fs');
const file = 'e:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN\\index.html';
let c = fs.readFileSync(file, 'utf8');

// Localizar e remover o campo lanc-contrato-pag
const idx = c.indexOf('lanc-contrato-pag');
if (idx < 0) { console.log('Nao encontrado'); process.exit(1); }

// Buscar o inicio do div pai mais proximo antes do idx
const divStart = c.lastIndexOf('<div class="lanc-field"', idx);
// Buscar o fim: proximo </div> apos o select de cierre
const selectEnd = c.indexOf('</select>', idx) + 9;
const divEnd = c.indexOf('</div>', selectEnd) + 6;

console.log('divStart:', divStart, ' divEnd:', divEnd);
console.log('Trecho a remover:', c.substring(divStart, divEnd));

// Remover o bloco inteiro incluindo espaco em branco ao redor
const antes   = c.substring(0, divStart).trimEnd();
const depois  = c.substring(divEnd).replace(/^\s*\n/, '\n');
c = antes + '\n' + depois;

fs.writeFileSync(file, c, 'utf8');
console.log('Campo N.º Contrato (lanc-contrato-pag) removido com sucesso!');
