const fs = require('fs');
const file = 'e:\\\\2026 SISTEMAS\\\\2025 Infra Sistemas YASMIN\\\\index.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/onclick=\"window\.lancIrParaAba\('fornecedores'\); return false;\"/g, 
  "onclick=\"const bs = Array.from(document.querySelectorAll('.fiscal-tab')); const b = bs.find(e => e.textContent.includes('Fornecedores')); if(b) b.click(); return false;\"");

content = content.replace(/onclick=\"window\.lancIrParaAba\('contratos'\); return false;\"/g, 
  "onclick=\"const bs = Array.from(document.querySelectorAll('.fiscal-tab')); const b = bs.find(e => e.textContent.includes('Contratos')); if(b) b.click(); return false;\"");

content = content.replace(/onclick=\"window\.lancIrParaAba\('empenhos'\); return false;\"/g, 
  "onclick=\"const bs = Array.from(document.querySelectorAll('.fiscal-tab')); const b = bs.find(e => e.textContent.includes('Empenhos')); if(b) b.click(); return false;\"");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed inline click handlers!');
