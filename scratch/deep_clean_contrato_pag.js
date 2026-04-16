const fs = require('fs');
const path = require('path');

const rootDir = 'e:\\2026 SISTEMAS\\2025 Infra Sistemas YASMIN';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory && !f.startsWith('.') && !f.includes('node_modules') ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const searchStr = 'lanc-contrato-pag';

walkDir(rootDir, (filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(searchStr)) {
                console.log('FOUND: ' + filePath);
                // Remover o campo
                // Procuramos o div pai
                const regex = /<div class="lanc-field" style="margin-bottom:1rem;">\s*<select id="lanc-contrato-pag"[\s\S]*?<\/select>\s*<\/div>/g;
                let newContent = content.replace(regex, '');
                
                // Se o regex falhar (pode estar sem o div ou formatado diferente), tentar remover apenas o select
                if (newContent === content) {
                    const regexSelect = /<select id="lanc-contrato-pag"[\s\S]*?<\/select>/g;
                    newContent = content.replace(regexSelect, '');
                }

                if (newContent !== content) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log('REMOVED field from ' + filePath);
                } else {
                    console.log('Found but could NOT remove automatically via regex from ' + filePath);
                }
            }
        } catch (e) {
            // Skip binary or unreadable files
        }
    }
});
