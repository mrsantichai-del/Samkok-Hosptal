const fs = require('fs');

function forceFixImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.match(/import.*ArrowUpDown.*from "lucide-react"/)) {
    content = content.replace(
      'import { Search, Plus, Edit, Trash2 }',
      'import { Search, Plus, Edit, Trash2, ArrowUpDown }'
    );
    content = content.replace(
      'import { Plus, Edit, Trash2 }',
      'import { Plus, Edit, Trash2, ArrowUpDown }'
    );
    fs.writeFileSync(file, content);
    console.log('Forced import in ' + file);
  }
}

forceFixImport('src/app/dashboard/departments/page.tsx');
forceFixImport('src/app/dashboard/employee-types/page.tsx');
forceFixImport('src/app/dashboard/positions/page.tsx');
