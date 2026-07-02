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
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regex to match icon-only buttons
  // <button [^>]*className="[^"]*"[^>]*>\s*<[A-Z][A-Za-z0-9]* className="w-[0-9] h-[0-9][^"]*" \/>\s*<\/button>
  const regex = /(<button[^>]*className=")([^"]*)("[^>]*>\s*<[A-Z][A-Za-z0-9]* className="w-[0-9]+ h-[0-9]+[^"]*"\s*\/>\s*<\/button>)/g;
  
  content = content.replace(regex, (match, p1, p2, p3) => {
    let classes = p2.split(' ');
    if (!classes.includes('flex')) classes.push('flex');
    if (!classes.includes('items-center')) classes.push('items-center');
    if (!classes.includes('justify-center')) classes.push('justify-center');
    if (!classes.includes('overflow-hidden')) classes.push('overflow-hidden');
    changed = true;
    return p1 + classes.join(' ') + p3;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
