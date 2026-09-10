const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix imports
content = content.replace(
  'import { ArrowLeft, Download, Save, Upload, Search, FileX2, Eye } from "lucide-react";',
  'import { ArrowLeft, Download, Save, Upload, Search, FileX2, Eye, Clock, CheckCircle, AlertCircle, Edit } from "lucide-react";\nimport { Badge } from "@/components/ui/badge";\nimport { jwtDecode } from "jwt-decode";'
);

fs.writeFileSync(file, content);
console.log('Fixed missing imports');
