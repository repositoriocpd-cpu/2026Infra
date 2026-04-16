const fs = require('fs');
const vm = require('vm');

const targetFile = 'index.html';
if (!fs.existsSync(targetFile)) {
    console.error('index.html not found');
    process.exit(1);
}

const content = fs.readFileSync(targetFile, 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let found = false;

while ((match = scriptRegex.exec(content)) !== null) {
    const script = match[1];
    console.log(`Checking block starting with: ${script.substring(0, 50).replace(/\n/g, ' ')}...`);
    if (script.includes('Script 5 starting')) {
        found = true;
        console.log('Found Script 5 block. Checking syntax...');
        try {
            new vm.Script(script);
            console.log('Syntax OK');
        } catch (e) {
            console.log('--- SYNTAX ERROR DETECTED ---');
            console.log(e.message);
            
            const lines = script.split('\n');
            const stackLines = e.stack.split('\n');
            // vm.Script stack trace: 'evalmachine.<anonymous>:line:col'
            const matchLine = e.stack.match(/evalmachine\.<anonymous>:(\d+)/);
            if (matchLine) {
                const lineNum = parseInt(matchLine[1]);
                console.log(`Error at line ${lineNum} of the script block.`);
                console.log('Line content:', lines[lineNum - 1]);
                console.log('\n--- Context ---');
                for (let i = Math.max(0, lineNum - 5); i < Math.min(lines.length, lineNum + 5); i++) {
                    console.log(`${i + 1}: ${lines[i]}`);
                }
            } else {
                console.log(e.stack);
            }
        }
    }
}

if (!found) console.log('Script 5 block not found.');
