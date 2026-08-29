const fs = require('fs');
const file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix handleExportPdf error handling
content = content.replace(
  'toast.error(`ไม่สามารถดาวน์โหลดไฟล์ PDF ได้: ${e.response?.data?.message || e.message}`, { id: toastId });',
  `let errorMessage = e.message;
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const json = JSON.parse(text);
          errorMessage = json.message || text;
        } catch (err) {
          try { errorMessage = await e.response.data.text(); } catch (err2) {}
        }
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      toast.error(\`ไม่สามารถดาวน์โหลดไฟล์ PDF ได้: \${errorMessage}\`, { id: toastId });`
);

// Fix handleExportExcel error handling
content = content.replace(
  'toast.error(`ไม่สามารถดาวน์โหลดไฟล์ Excel ได้: ${e.response?.data?.message || e.message}`, { id: toastId });',
  `let errorMessage = e.message;
      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const json = JSON.parse(text);
          errorMessage = json.message || text;
        } catch (err) {
          try { errorMessage = await e.response.data.text(); } catch (err2) {}
        }
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      toast.error(\`ไม่สามารถดาวน์โหลดไฟล์ Excel ได้: \${errorMessage}\`, { id: toastId });`
);

fs.writeFileSync(file, content);
