const fs = require('fs');

function fixTemporalDeadZone(file, filteredVar, sortedVar) {
  let content = fs.readFileSync(file, 'utf8');

  // Find the exact useMemo block
  const useMemoStartStr = `const ${sortedVar} = React.useMemo(() => {`;
  
  if (!content.includes(useMemoStartStr)) {
    console.log('Could not find useMemo block in ' + file);
    return;
  }
  
  const startIdx = content.indexOf(useMemoStartStr);
  const endStr = `}, [${filteredVar}, sortConfig]);`;
  const endIdx = content.indexOf(endStr, startIdx);
  
  if (endIdx === -1) {
    console.log('Could not find end of useMemo block in ' + file);
    return;
  }
  
  const fullBlock = content.slice(startIdx, endIdx + endStr.length);
  
  // Remove block
  content = content.replace(fullBlock, '');
  
  // Find where filteredVar ends
  const filterEndStr = "return b.name.localeCompare(a.name, 'th');\n  });";
  const filterEndIdx = content.indexOf(filterEndStr);
  
  if (filterEndIdx !== -1) {
    const splitIdx = filterEndIdx + filterEndStr.length;
    content = content.slice(0, splitIdx) + '\n\n  ' + fullBlock + content.slice(splitIdx);
    fs.writeFileSync(file, content);
    console.log('Fixed TDZ in ' + file);
  } else {
    // If not found, try alternative
    console.log('Could not find filterEndStr in ' + file);
  }
}

fixTemporalDeadZone('src/app/dashboard/departments/page.tsx', 'filteredDepartments', 'sortedDepartments');
fixTemporalDeadZone('src/app/dashboard/employee-types/page.tsx', 'filteredTypes', 'sortedData');
fixTemporalDeadZone('src/app/dashboard/positions/page.tsx', 'filteredTypes', 'sortedData');
