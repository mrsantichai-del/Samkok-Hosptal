const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add record state
content = content.replace(
  'const [viewingEmp, setViewingEmp] = useState<any>(null);',
  'const [viewingEmp, setViewingEmp] = useState<any>(null);\n  const [record, setRecord] = useState<any>(null);\n  const [user, setUser] = useState<any>(null);'
);

// 2. Import jwtDecode and other components
content = content.replace(
  'import { ArrowLeft, Download, Upload, Eye, Save } from "lucide-react";',
  'import { ArrowLeft, Download, Upload, Eye, Save, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";\nimport { jwtDecode } from "jwt-decode";\nimport { Badge } from "@/components/ui/badge";'
);

// 3. Update fetchData
const newFetch = `
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (token) {
        try {
          setUser(jwtDecode(token));
        } catch(e){}
      }
      const [txRes, itemsRes, typeRes, recRes] = await Promise.all([
        axios.get(\`\${API_URL}/payroll/records/\${resolvedParams.id}/transactions\`, { headers: { Authorization: \`Bearer \${token}\` } }),
        axios.get(\`\${API_URL}/pay-items\`, { headers: { Authorization: \`Bearer \${token}\` } }),
        axios.get(\`\${API_URL}/employees/types\`, { headers: { Authorization: \`Bearer \${token}\` } }),
        axios.get(\`\${API_URL}/payroll/records/\${resolvedParams.id}\`, { headers: { Authorization: \`Bearer \${token}\` } })
      ]);
      setTransactions(txRes.data);
      setAllPayItems(itemsRes.data);
      setEmployeeTypes(typeRes.data);
      setRecord(recRes.data);
`;
content = content.replace(/const fetchData = async \(\) => \{\n    setLoading\(true\);\n    try \{\n      const token = Cookies\.get\("token"\);\n      const \[txRes, itemsRes, typeRes\] = await Promise\.all\(\[\n        axios\.get\(`\$\{API_URL\}\/payroll\/records\/\$\{resolvedParams\.id\}\/transactions`, \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \}\),\n        axios\.get\(`\$\{API_URL\}\/pay-items`, \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \}\),\n        axios\.get\(`\$\{API_URL\}\/employees\/types`, \{ headers: \{ Authorization: `Bearer \$\{token\}` \} \}\)\n      \]\);\n      setTransactions\(txRes\.data\);\n      setAllPayItems\(itemsRes\.data\);\n      setEmployeeTypes\(typeRes\.data\);/, newFetch);

// 4. Input locking
content = content.replace(
  'type="number"',
  'type="number"\n                                  readOnly={record?.status !== "DRAFT"}'
);
content = content.replace(
  /onChange=\{\(e\) => handleCellChange\(emp\.employeeId, item\.id, e\.target\.value\)\}/g,
  'onChange={(e) => { if (record?.status === "DRAFT") handleCellChange(emp.employeeId, item.id, e.target.value); }}'
);

fs.writeFileSync(file, content);
console.log('Phase 1 of payroll detail update complete');
