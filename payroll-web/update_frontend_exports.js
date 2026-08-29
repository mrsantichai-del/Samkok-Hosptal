const fs = require('fs');
const file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// handleExportExcel
content = content.replace(
  'const res = await axios.get(`${API_URL}/payroll/records/${resolvedParams.id}/export/excel`, { headers: { Authorization: `Bearer ${token}` }, responseType: \'blob\' });',
  'const employeeIds = filteredEmployees.map(e => e.employeeId);\n        const res = await axios.post(`${API_URL}/payroll/records/${resolvedParams.id}/export/excel`, { employeeIds }, { headers: { Authorization: `Bearer ${token}` }, responseType: \'blob\' });'
);

// handleExportPdf
content = content.replace(
  'const res = await axios.get(`${API_URL}/payroll/records/${resolvedParams.id}/export/pdf`, { headers: { Authorization: `Bearer ${token}` }, responseType: \'blob\' });',
  'const employeeIds = filteredEmployees.map(e => e.employeeId);\n        const res = await axios.post(`${API_URL}/payroll/records/${resolvedParams.id}/export/pdf`, { employeeIds }, { headers: { Authorization: `Bearer ${token}` }, responseType: \'blob\' });'
);

fs.writeFileSync(file, content);
