const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /const data = await res\.json\(\);\s*if\s*\(res\.ok\)\s*\{/g,
    'if (res.ok) {\n        const data = await res.json();'
  );
  // for TemplateSettings
  content = content.replace(
    /const data = await res\.json\(\);\s*if\s*\(res\.ok\)\s*\{\s*setTemplates\(\{\s*\.\.\.templates,\s*\[activeTab\]: data\.template\s*\}\);/g,
    'if (res.ok) {\n        const data = await res.json();\n        setTemplates({\n          ...templates,\n          [activeTab]: data.template\n        });'
  );
  fs.writeFileSync(file, content);
}

fixFile('src/PrivateNotes.tsx');
fixFile('src/InterviewScheduler.tsx');
fixFile('src/TemplateSettings.tsx');
