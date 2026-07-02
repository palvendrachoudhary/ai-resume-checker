const fs = require('fs');
const path = require('path');

const files = ['./src/RecruiterView.tsx', './src/RecentScans.tsx', './src/CandidateCard.tsx'];
files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We can just find any button with a single SVG child.
  // <button ...> <Icon /> </button>
  const regex = /(<button[^>]*className=")([^"]*)("([^>]*)>\s*<[A-Z][A-Za-z0-9]*[^>]*\/>\s*<\/button>)/gs;
  
  content = content.replace(regex, (match, p1, p2, p3) => {
    let classes = p2.split(' ');
    if (!classes.includes('flex')) classes.push('flex');
    if (!classes.includes('items-center')) classes.push('items-center');
    if (!classes.includes('justify-center')) classes.push('justify-center');
    if (!classes.includes('overflow-hidden')) classes.push('overflow-hidden');
    changed = true;
    return p1 + classes.join(' ') + p3;
  });

  // Also catch <button> {isDark ? <Sun/> : <Moon/>} </button>
  const regex2 = /(<button[^>]*className=")([^"]*)("([^>]*)>\s*\{[^}]+\?[^}]+\:[^}]+\}\s*<\/button>)/gs;
  content = content.replace(regex2, (match, p1, p2, p3) => {
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
