const fs = require('fs');
const r = JSON.parse(fs.readFileSync('./lighthouse-report3.json', 'utf8'));
let out = '';
const cat = r.categories['performance'];
out += '--- Performance (' + Math.round(cat.score * 100) + ') ---\n';
cat.auditRefs.forEach(ref => {
  const audit = r.audits[ref.id];
  if (audit && audit.score !== null && audit.score < 1 && ref.weight > 0) {
    out += `\n- ${audit.title} | ID: ${audit.id} | Score: ${audit.score}\n`;
    if(audit.details && audit.details.items) {
      audit.details.items.slice(0, 3).forEach((i, idx) => {
        out += `  [${idx+1}] `;
        if (i.node && i.node.snippet) out += `Snippet: ${i.node.snippet.substring(0, 50)}\n`;
        else if (i.url) out += `URL: ${i.url} (Waste: ${i.wastedMs}ms / ${i.wastedBytes}bytes)\n`;
        else out += `Data: ${JSON.stringify(i).substring(0, 80)}\n`;
      });
    }
  }
});
fs.writeFileSync('./lh-perf.md', out, 'utf8');
