const fs = require('fs');
const path = require('path');

/**
 * Script para substituir marcadores de variáveis de ambiente no build do Netlify.
 * Uso: node build-env.js ./dist/index.html
 */

const filePath = process.argv[2];
if (!filePath) {
    console.error('Uso: node build-env.js <caminho_do_arquivo>');
    process.exit(1);
}

const fullPath = path.resolve(filePath);
if (!fs.existsSync(fullPath)) {
    console.error(`Arquivo não encontrado: ${fullPath}`);
    process.exit(1);
}

let content = fs.readFileSync(fullPath, 'utf8');

// Variáveis de ambiente Suadas no Netlify
const supabaseUrl = process.env.SUPABASE_URL || '___MISSING_SUPABASE_URL___';
const supabaseKey = process.env.SUPABASE_KEY || '___MISSING_SUPABASE_KEY___';

console.log(`Substituindo variáveis em: ${filePath}`);
console.log(`- SUPABASE_URL: ${supabaseUrl.substring(0, 10)}${supabaseUrl.length > 10 ? '...' : ''}`);

// Substituição dos marcadores %%VAR%%
content = content.replace(/%%SUPABASE_URL%%/g, supabaseUrl);
content = content.replace(/%%SUPABASE_KEY%%/g, supabaseKey);

fs.writeFileSync(fullPath, content);
console.log('Substituição concluída com sucesso!');
