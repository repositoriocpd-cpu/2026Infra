const fs = require('fs');
const path = require('path');

const targetFile = path.join(process.cwd(), 'index.html');

const patterns = {
    'Ã§': 'ç',
    'Ã£': 'ã',
    'Ã©': 'é',
    'Ã¡': 'á',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ãª': 'ê',
    'Ãµ': 'õ',
    'Ã': 'à',
    'Âº': 'º',
    'ǜ': 'ão',
    'Ǹ': 'é',
    'MǦs': 'Mês',
    'à‡à•ES': 'ÇÕES',
    'à‡': 'Ç',
    'à•': 'Õ',
    'à³': 'ó',
    'à¡': 'á',
    'à©': 'é',
    'àª': 'ê',
    'àº': 'ú',
    'àµ': 'õ',
    'à€': 'À',
    'à': 'à'
};

try {
    let content = fs.readFileSync(targetFile, 'utf8');
    
    // Fix patterns
    for (const [corrupted, fixed] of Object.entries(patterns)) {
        content = content.split(corrupted).join(fixed);
    }

    // Specific lexical fixes
    content = content.replace(/Detecǜo/g, 'Detecção');
    content = content.replace(/mediǜo/g, 'medição');

    // Add missing closing tags if missing at the end
    if (!content.trim().endsWith('</html>')) {
        console.log('Adding missing closing tags...');
        // Find if </script> is missing
        if (!content.includes('</script>', content.lastIndexOf('<script'))) {
             content = content.trimEnd() + '\n    </script>\n</body>\n</html>';
        } else if (!content.includes('</body>')) {
             content = content.trimEnd() + '\n</body>\n</html>';
        }
    }

    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`Restoration complete.`);
} catch (err) {
    console.error('Error during restoration:', err);
}
