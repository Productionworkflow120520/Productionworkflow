const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
const apiCalls = [];
const apiRegex = /['"`](\/api\/[^'"`\?]+)(\?[^'"`]*)?['"`]/g;

files.forEach(f => {
  if (f.includes(path.join('src', 'app', 'api'))) return;
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = apiRegex.exec(content)) !== null) {
    apiCalls.push({ endpoint: match[1], file: f });
  }
});

console.log(JSON.stringify(apiCalls, null, 2));
