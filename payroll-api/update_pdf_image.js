const fs = require('fs');
const file = 'src/payroll/payroll.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '      if (logoPath) {\n        doc.image(logoPath, 50, 45, { height: 40 });\n      }',
  '      if (logoPath) {\n        try {\n          doc.image(logoPath, 50, 45, { height: 40 });\n        } catch (err) {\n          console.error("Failed to load logo image:", err);\n        }\n      }'
);

content = content.replace(
  '      if (signaturePath) {\n        doc.image(signaturePath, 300, endY + 50, { height: 40 });\n      }',
  '      if (signaturePath) {\n        try {\n          doc.image(signaturePath, 300, endY + 50, { height: 40 });\n        } catch (err) {\n          console.error("Failed to load signature image:", err);\n        }\n      }'
);

fs.writeFileSync(file, content);
