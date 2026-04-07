const fs = require('fs');
const r = JSON.parse(fs.readFileSync('./lighthouse-report2.json', 'utf8'));
let out = '';
const getFails = catId => {
  const cat = r.categories[catId];
  if (!cat) return;
  out += '\n--- ' + cat.title + ' ---\n';
  cat.auditRefs.forEach(ref => {
    const audit = r.audits[ref.id];
    if (audit && audit.score !== null && audit.score < 1 && ref.weight > 0) {
      out += `\n- ${audit.title} | ID: ${audit.id} | Score: ${audit.score}\n`;
      if(audit.details && audit.details.items) {
        audit.details.items.slice(0, 5).forEach((i, idx) => {
          out += `  [${idx+1}] `;
          if (i.node && i.node.snippet) out += `Snippet: ${i.node.snippet}\n`;
          else if (i.url) out += `URL: ${i.url}\n`;
          else out += `Data: ${JSON.stringify(i).substring(0, 100)}\n`;
        });
      }
    }
  });
};
getFails('accessibility');
getFails('seo');
getFails('best-practices');
fs.writeFileSync('./lh-details2.md', out, 'utf8');
