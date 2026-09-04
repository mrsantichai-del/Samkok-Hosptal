const fs = require('fs');

const fixSorting = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Remove the old sortOrder state
  content = content.replace(/const \[sortOrder, setSortOrder\] = useState\("asc"\);\s*/, '');

  // Modify the .sort() block for filtered data to NOT use sortOrder
  // Instead, the new sorting uses `sortedData` which wraps `filteredItems`
  // Wait, let's see how filteredTypes is defined.
  // We can just remove the .sort() from filteredTypes.
  const regexFilterSort = /\.sort\(\(a, b\) => \{\s*if \(sortOrder === "asc"\) return a\.name\.localeCompare\(b\.name, 'th'\);\s*return b\.name\.localeCompare\(a\.name, 'th'\);\s*\}\)/;
  content = content.replace(regexFilterSort, '');

  // Remove the sort dropdown UI blocks. They might be duplicated.
  // We'll use a regex that matches the div containing the Label and select.
  const dropdownRegex = /<div className="flex items-center gap-2">\s*<Label className="text-sm font-semibold whitespace-nowrap">เรียงลำดับ:<\/Label>[\s\S]*?<\/select>\s*<\/div>/g;
  content = content.replace(dropdownRegex, '');

  // In some files, there might be a trailing </div> if it was duplicated strangely.
  // Wait, let's just do the replace and then we can check.

  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
};

fixSorting('src/app/dashboard/employee-types/page.tsx');
fixSorting('src/app/dashboard/departments/page.tsx');
fixSorting('src/app/dashboard/positions/page.tsx');

