const fs = require('fs');
try {
  const replaceWikimedia = (file) => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(/https:\/\/upload\.wikimedia\.org\/wikipedia[^"']+/g, 'public/assets/images/logo-itaguai.png');
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`No wikimedia links found in ${file}`);
    }
  };

  replaceWikimedia('index.html');
  replaceWikimedia('2026_script.js');
  replaceWikimedia('antigo2026 Infra Sistemas.html');
  console.log('Cleanup finished.');
} catch (e) {
  console.error("Error:", e);
}
