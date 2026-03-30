const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (
    l.includes('cpdinfra') ||
    l.includes('loginEmail') ||
    l.includes('loginPwd') ||
    l.includes('autocomplete') ||
    l.includes('type="email"') ||
    l.includes('type="password"') ||
    l.includes('value=')
  ) {
    console.log(i + 1, l.substring(0, 150));
  }
});
