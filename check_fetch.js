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
  if (content.includes('fetch(') && content.includes('.json()')) {
    console.log(file);
    // Print 3 lines before and after fetch
    const lines = content.split('\n');
    lines.forEach((l, i) => {
       if (l.includes('.json()')) {
          console.log(`  ${i+1}: ${l.trim()}`);
       }
    });
  }
});
