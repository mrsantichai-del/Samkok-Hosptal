const fs = require('fs');
const files = [
    'src/app/dashboard/employees/page.tsx',
    'src/app/dashboard/pay-items/page.tsx',
    'src/app/dashboard/payroll/page.tsx',
    'src/app/dashboard/payroll/[id]/page.tsx',
    'src/app/dashboard/settings/page.tsx'
];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (content.startsWith('import { API_URL }')) {
        content = content.replace('import { API_URL } from "@/lib/config";\r\n"use client";', '"use client";\r\nimport { API_URL } from "@/lib/config";');
        content = content.replace('import { API_URL } from "@/lib/config";\n"use client";', '"use client";\nimport { API_URL } from "@/lib/config";');
        fs.writeFileSync(f, content);
    }
});
