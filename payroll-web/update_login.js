const fs = require('fs');
const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('sonner')) {
  content = content.replace('import { useRouter }', 'import { useRouter } from "next/navigation";\nimport { toast } from "sonner";\n// remove old import');
  // Wait, I don't know exactly how page.tsx is structured, so let's check it first.
}
