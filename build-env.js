const fs = require('fs');
const path = require('path');

/**
 * Script para substituir marcadores de variáveis de ambiente no build do Netlify.
 * Uso: node build-env.js [caminho_do_arquivo]
 * Se nenhum caminho for fornecido, lê o diretório de build do .build-output.json
 */

let filePath;

if (process.argv[2]) {
    filePath = process.argv[2];
} else {
    // Auto-detect build output directory
    const buildOutputPath = path.join(__dirname, '.build-output.json');
    if (fs.existsSync(buildOutputPath)) {
        const buildOutput = JSON.parse(fs.readFileSync(buildOutputPath, 'utf8'));
        filePath = path.join(buildOutput.buildDir, 'index.html');
    } else {
        filePath = path.join(__dirname, 'dist', 'index.html');
    }
}

const fullPath = path.resolve(filePath);
if (!fs.existsSync(fullPath)) {
    console.error(`Arquivo não encontrado: ${fullPath}`);
    process.exit(1);
}

let content = fs.readFileSync(fullPath, 'utf8');

// Variáveis de ambiente usadas no Netlify (fallback para valores padrão se não definidas)
const supabaseUrl = process.env.SUPABASE_URL || 'https://sxsfqvcxikdsahhidrdx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c2ZxdmN4aWtkc2FoaGlkcmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjg3NTQsImV4cCI6MjA4ODkwNDc1NH0.5ftyFtzmIlvNX-Oj5p-0JwwJEBHajUn5XBAVjkLC82Y';

console.log(`Substituindo variáveis em: ${filePath}`);
console.log(`- SUPABASE_URL: ${supabaseUrl.substring(0, 10)}${supabaseUrl.length > 10 ? '...' : ''}`);

// Substituição dos marcadores %%VAR%%
content = content.replace(/%%SUPABASE_URL%%/g, supabaseUrl);
content = content.replace(/%%SUPABASE_KEY%%/g, supabaseKey);

fs.writeFileSync(fullPath, content);
console.log('Substituição concluída com sucesso!');
