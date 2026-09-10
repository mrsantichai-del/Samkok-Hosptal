const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `{net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                           </TableCell>
                         </TableRow>`;

const replacement = `{net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                           </TableCell>
                           <TableCell className="border border-gray-300 p-1 text-center sticky right-0 z-10 bg-gray-100 group-hover:bg-gray-200 shadow-[-1px_0_0_0_#e5e7eb] w-[60px]">
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewingEmp(emp)}>
                               <Eye className="h-4 w-4 text-blue-600" />
                             </Button>
                           </TableCell>
                         </TableRow>`;

// handle both \n and \r\n
const lines = content.split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}')) {
    // found it.
    // Replace the next lines
    if (lines[i+1].includes('</TableCell>') && lines[i+2].includes('</TableRow>')) {
      lines[i+2] = lines[i+2].replace(
        '</TableRow>',
        `  <TableCell className="border border-gray-300 p-1 text-center sticky right-0 z-10 bg-gray-100 group-hover:bg-gray-200 shadow-[-1px_0_0_0_#e5e7eb] w-[60px]">\n                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewingEmp(emp)}>\n                               <Eye className="h-4 w-4 text-blue-600" />\n                             </Button>\n                           </TableCell>\n                         </TableRow>`
      );
      break;
    }
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed using array iteration');
