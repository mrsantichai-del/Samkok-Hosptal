const fs = require('fs');
const file = 'src/payroll/payroll.service.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `const { bahttext } = require('bahttext');
      const fs = require('fs');
      const path = require('path');

      // Use path.join with __dirname so it works in both dev (dist/) and prod (dist/)
      const fontRegular = path.join(__dirname, '..', 'assets', 'fonts', 'Sarabun-Regular.ttf');
      const fontBold = path.join(__dirname, '..', 'assets', 'fonts', 'Sarabun-Bold.ttf');
      
      // Fallbacks just in case we are running from src/ directly (e.g. ts-node)
      const finalFontRegular = fs.existsSync(fontRegular) ? fontRegular : path.join(process.cwd(), 'src', 'assets', 'fonts', 'Sarabun-Regular.ttf');
      const finalFontBold = fs.existsSync(fontBold) ? fontBold : path.join(process.cwd(), 'src', 'assets', 'fonts', 'Sarabun-Bold.ttf');

      doc.registerFont('ThaiRegular', finalFontRegular);
      doc.registerFont('ThaiBold', finalFontBold);`;

content = content.replace(
  /doc\.registerFont\('ThaiRegular', 'src\/assets\/fonts\/Sarabun-Regular\.ttf'\);\s*doc\.registerFont\('ThaiBold', 'src\/assets\/fonts\/Sarabun-Bold\.ttf'\);\s*const \{ bahttext \} = require\('bahttext'\);\s*const fs = require\('fs'\);\s*const path = require\('path'\);/,
  replacement
);

fs.writeFileSync(file, content);
