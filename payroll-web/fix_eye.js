const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the row end with the new column + row end
content = content.replace(
  /\{net\.toLocaleString[^\}]+?\}\}\s*<\/TableCell>\s*<\/TableRow>/g,
  `{net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                           </TableCell>
                           <TableCell className="border border-gray-300 p-1 text-center sticky right-0 z-10 bg-gray-100 group-hover:bg-gray-200 shadow-[-1px_0_0_0_#e5e7eb] w-[60px]">
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewingEmp(emp)}>
                               <Eye className="h-4 w-4 text-blue-600" />
                             </Button>
                           </TableCell>
                         </TableRow>`
);

fs.writeFileSync(file, content);
console.log('Fixed Eye button insertion');
