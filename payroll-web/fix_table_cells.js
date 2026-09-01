const fs = require('fs');

function fixTableCells(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('{index + 1}</TableCell>')) {
    content = content.replace(
      '<TableRow key={item.id}>',
      '<TableRow key={item.id}>\n                  <TableCell className="text-center text-gray-500">{index + 1}</TableCell>'
    );
    // Fix colSpan in empty state
    content = content.replace(/colSpan=\{3\}/g, 'colSpan={4}');
    
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
}

fixTableCells('src/app/dashboard/employee-types/page.tsx');
fixTableCells('src/app/dashboard/positions/page.tsx');
fixTableCells('src/app/dashboard/departments/page.tsx');
