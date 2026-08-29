const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/pay-items/page.tsx', 'utf8');
if (!content.includes('sonner')) {
  content = content.replace('import { Button }', 'import { toast } from "sonner";\nimport { Button }');
  fs.writeFileSync('src/app/dashboard/pay-items/page.tsx', content);
}
