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
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.match(/className=".*w-[0-9]+ h-[0-9]+.*"/)) {
      if (!line.includes('flex items-center justify-center') && line.includes('rounded-full')) {
         console.log(`${file}:${i+1} - ${line.trim()}`);
      }
    }
  });
});
