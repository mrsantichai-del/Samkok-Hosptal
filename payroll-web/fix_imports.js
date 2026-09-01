const fs = require('fs');

function fixImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('ArrowUpDown')) {
    content = content.replace(
      'import { Search, Plus, Edit, Trash2 }',
      'import { Search, Plus, Edit, Trash2, ArrowUpDown }'
    );
    // Also try without Search just in case
    content = content.replace(
      'import { Plus, Edit, Trash2 }',
      'import { Plus, Edit, Trash2, ArrowUpDown }'
    );
    fs.writeFileSync(file, content);
    console.log('Fixed imports in ' + file);
  }
}

fixImport('src/app/dashboard/departments/page.tsx');
fixImport('src/app/dashboard/employee-types/page.tsx');
fixImport('src/app/dashboard/positions/page.tsx');
