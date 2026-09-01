const fs = require('fs');
const path = require('path');

const file = 'src/payroll/payroll.service.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Add createClient to imports if not exists
if (!content.includes("import { createClient }")) {
  content = content.replace("import * as fs from 'fs';", "import * as fs from 'fs';\nimport { createClient } from '@supabase/supabase-js';");
}

// 2. Add supabase client instance inside the file
if (!content.includes("const supabase = createClient(")) {
  const insertIndex = content.indexOf('@Injectable()');
  content = content.slice(0, insertIndex) + `const supabase = createClient(
  process.env.SUPABASE_URL || 'https://wjjewbltlwvsqljeazlz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamV3Ymx0bHd2c3FsamVhemx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczOTkxNCwiZXhwIjoyMTAzMzE1OTE0fQ.j2TyaPGhFOIvoO7RhO7i6CKJspjMoia4gMPJ5VVMKH4'
);\n\n` + content.slice(insertIndex);
}

// 3. Replace getImagePath with fetchImageBuffer
const oldGetImagePath = `    const getImagePath = (name: string) => {
      const exts = ['.png', '.jpg', '.jpeg'];
      for (const ext of exts) {
        const p = path.join(process.cwd(), 'uploads', name + ext);
        if (fs.existsSync(p)) return p;
      }
      return null;
    };
    
    const logoPath = getImagePath('logo');
    const signaturePath = getImagePath('signature');`;

const newGetImageBuffer = `    const fetchImageBuffer = async (namePrefix: string) => {
      const { data, error } = await supabase.storage.from('uploads').list();
      if (error || !data) return null;
      const file = data.find(f => f.name.startsWith(namePrefix + '.'));
      if (!file) return null;
      const { data: fileData, error: downloadError } = await supabase.storage.from('uploads').download(file.name);
      if (downloadError || !fileData) return null;
      const arrayBuffer = await fileData.arrayBuffer();
      return Buffer.from(arrayBuffer);
    };

    const logoBuffer = await fetchImageBuffer('logo');
    const signatureBuffer = await fetchImageBuffer('signature');`;

content = content.replace(oldGetImagePath, newGetImageBuffer);

// 4. Replace logoPath and signaturePath in doc.image
content = content.replace(/logoPath/g, 'logoBuffer');
content = content.replace(/signaturePath/g, 'signatureBuffer');

fs.writeFileSync(file, content);
console.log("Updated payroll.service.ts");
