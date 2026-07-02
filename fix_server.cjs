const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace JSON.parse(response.text || "{}") with a safer parse
content = content.replace(/JSON\.parse\(response\.text \|\| "\{\}"\)/g, `(() => {
          let text = response.text || "{}";
          text = text.replace(/^\\s*\`\`\`json/m, '').replace(/\`\`\`\\s*$/m, '');
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse JSON from AI response:", text);
            return {};
          }
        })()`);
fs.writeFileSync('server.ts', content);
