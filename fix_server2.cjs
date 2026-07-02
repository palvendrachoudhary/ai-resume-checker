const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/jsonRes = JSON\.parse\(response\.text\.trim\(\)\);/g, `
          let text = response.text.trim();
          text = text.replace(/^\\s*\`\`\`json/m, '').replace(/\`\`\`\\s*$/m, '');
          jsonRes = JSON.parse(text);
`);

fs.writeFileSync('server.ts', content);
