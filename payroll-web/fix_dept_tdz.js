const fs = require('fs');
const file = 'src/app/dashboard/departments/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const useMemoStartStr = `const sortedDepartments = React.useMemo(() => {`;
const startIdx = content.indexOf(useMemoStartStr);
const endStr = `}, [filteredDepartments, sortConfig]);`;
const endIdx = content.indexOf(endStr, startIdx);

const fullBlock = content.slice(startIdx, endIdx + endStr.length);
content = content.replace(fullBlock, '');

const regex = /return b.name.localeCompare\(a.name, 'th'\);\r?\n  }\);/;
const match = content.match(regex);
if (match) {
  const splitIdx = match.index + match[0].length;
  content = content.slice(0, splitIdx) + '\n\n  ' + fullBlock + content.slice(splitIdx);
  fs.writeFileSync(file, content);
  console.log('Fixed TDZ in departments');
} else {
  console.log('Could not find match');
}
