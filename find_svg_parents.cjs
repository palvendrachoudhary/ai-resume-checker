const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Simple regex to find <Element className="...">\n\s*<LucideIcon
  const matches = content.match(/<([A-Za-z0-9]+)\s+className="([^"]+)"[^>]*>\s*<([A-Z][a-zA-Z0-9]*)\s+className="[^"]*w-[0-9]+\s+h-[0-9]+[^"]*"/g);
  if (matches) {
     matches.forEach(m => console.log(file + ": " + m.replace(/\n/g, ' ')));
  }
});
