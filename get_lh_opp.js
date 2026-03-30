const fs = require('fs');
const r = JSON.parse(fs.readFileSync('./lighthouse-report3.json', 'utf8'));
let out = '--- Opportunities ---\n';
Object.values(r.audits).forEach(audit => {
  if (audit.details && audit.details.type === 'opportunity' && audit.details.overallSavingsMs > 0) {
    out += `\n- ${audit.title} (Savings: ${audit.details.overallSavingsMs}ms) | ID: ${audit.id}\n`;
    if(audit.details.items) {
      audit.details.items.slice(0, 5).forEach((i, idx) => {
        out += `  [${idx+1}] URL: ${i.url} (Waste: ${i.wastedMs ? i.wastedMs + 'ms' : ''} ${i.wastedBytes ? i.wastedBytes + ' bytes' : ''})\n`;
      });
    }
  }
});
fs.writeFileSync('./lh-opp.md', out, 'utf8');
