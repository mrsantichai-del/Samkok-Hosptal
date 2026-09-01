const fs = require('fs');

function fixSortingData(file, dataVar) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(
    /let sortableItems = \[\.\.\.types\];/g,
    `let sortableItems = [...${dataVar}];`
  );
  content = content.replace(
    /\[types, sortConfig\]/g,
    `[${dataVar}, sortConfig]`
  );
  
  // Actually, wait, the loop variable in their maps might be different!
  if (file.includes('positions')) {
    content = content.replace(
      'filteredTypes.map((item) => (',
      'sortedData.map((item: any, index: number) => ('
    );
  }
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

fixSortingData('src/app/dashboard/positions/page.tsx', 'filteredTypes');

// Employee-types might also be using filteredTypes?
let etContent = fs.readFileSync('src/app/dashboard/employee-types/page.tsx', 'utf8');
if (etContent.includes('filteredTypes.map')) {
  etContent = etContent.replace(
    /let sortableItems = \[\.\.\.types\];/g,
    `let sortableItems = [...filteredTypes];`
  );
  etContent = etContent.replace(
    /\[types, sortConfig\]/g,
    `[filteredTypes, sortConfig]`
  );
  etContent = etContent.replace(
    'filteredTypes.map((item) => (',
    'sortedData.map((item: any, index: number) => ('
  );
  fs.writeFileSync('src/app/dashboard/employee-types/page.tsx', etContent);
}

// Departments page sorting fix
let deptContent = fs.readFileSync('src/app/dashboard/departments/page.tsx', 'utf8');
if (deptContent.includes('filteredDepartments.map') || deptContent.includes('filteredTypes.map')) {
  deptContent = deptContent.replace(
    /let sortableItems = \[\.\.\.departments\];/g,
    `let sortableItems = [...filteredTypes];`
  );
  deptContent = deptContent.replace(
    /\[departments, sortConfig\]/g,
    `[filteredTypes, sortConfig]`
  );
  deptContent = deptContent.replace(
    'filteredTypes.map((item) => (',
    'sortedDepartments.map((item: any, index: number) => ('
  );
  fs.writeFileSync('src/app/dashboard/departments/page.tsx', deptContent);
}

