const fs = require('fs');
let file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all instances of `className="... bg-white ..."` inside the mapping function with template strings.
content = content.replace(
  /<TableCell className="border border-gray-300 p-1 text-center sticky left-0 z-10 bg-white group-hover:bg-blue-50\/50 text-\[11px\] text-gray-500">/g,
  '<TableCell className={`border border-gray-300 p-1 text-center sticky left-0 z-10 ${isModified ? "bg-yellow-50" : "bg-white"} group-hover:bg-blue-50/50 text-[11px] text-gray-500`}>'
);

content = content.replace(
  /<TableCell className="border border-gray-300 p-1 sticky left-\[30px\] z-10 bg-white group-hover:bg-blue-50\/50 font-medium truncate min-w-\[150px\] w-\[150px\] text-\[11px\]" title=\{`\$\{emp\.employeeCode\} \$\{emp\.firstName\} \$\{emp\.lastName\}`\}>/g,
  '<TableCell className={`border border-gray-300 p-1 sticky left-[30px] z-10 ${isModified ? "bg-yellow-50" : "bg-white"} group-hover:bg-blue-50/50 font-medium truncate min-w-[150px] w-[150px] text-[11px]`} title={`${emp.employeeCode} ${emp.firstName} ${emp.lastName}`}>'
);

content = content.replace(
  /<TableCell className="border border-gray-300 p-1 text-center sticky left-\[180px\] z-10 bg-white group-hover:bg-blue-50\/50 truncate min-w-\[80px\] w-\[80px\] text-\[10px\] text-gray-600" title=\{emp\.position\?\.name \|\| '-'\}>/g,
  '<TableCell className={`border border-gray-300 p-1 text-center sticky left-[180px] z-10 ${isModified ? "bg-yellow-50" : "bg-white"} group-hover:bg-blue-50/50 truncate min-w-[80px] w-[80px] text-[10px] text-gray-600`} title={emp.position?.name || "-"}>'
);

content = content.replace(
  /<TableCell className="border border-gray-300 p-1 text-center sticky left-\[260px\] z-10 bg-white group-hover:bg-blue-50\/50 truncate min-w-\[80px\] w-\[80px\] text-\[10px\] text-gray-600 shadow-\[1px_0_0_0_#e5e7eb\]" title=\{emp\.employeeType\?\.name \|\| '-'\}>/g,
  '<TableCell className={`border border-gray-300 p-1 text-center sticky left-[260px] z-10 ${isModified ? "bg-yellow-50" : "bg-white"} group-hover:bg-blue-50/50 truncate min-w-[80px] w-[80px] text-[10px] text-gray-600 shadow-[1px_0_0_0_#e5e7eb]`} title={emp.employeeType?.name || "-"}>'
);

// For the inputs map
content = content.replace(
  /<TableCell key=\{item\.id\} className="border border-gray-300 p-0 bg-white min-w-\[95px\] w-\[95px\]">/g,
  '<TableCell key={item.id} className={`border border-gray-300 p-0 min-w-[95px] w-[95px] ${isModified ? "bg-yellow-50" : "bg-white"}`}>'
);

// For net total and action buttons
content = content.replace(
  /<TableCell className="border border-gray-300 p-1 text-right font-bold text-gray-900 sticky right-\[60px\] z-10 bg-gray-100 group-hover:bg-gray-200 text-\[11px\] min-w-\[100px\] w-\[100px\]">/g,
  '<TableCell className={`border border-gray-300 p-1 text-right font-bold text-gray-900 sticky right-[60px] z-10 ${isModified ? "bg-yellow-100" : "bg-gray-100"} group-hover:bg-gray-200 text-[11px] min-w-[100px] w-[100px]`}>'
);

content = content.replace(
  /<TableCell className="border border-gray-300 p-1 text-center sticky right-0 z-10 bg-gray-100 group-hover:bg-gray-200 shadow-\[-1px_0_0_0_#e5e7eb\] w-\[60px\]">/g,
  '<TableCell className={`border border-gray-300 p-1 text-center sticky right-0 z-10 ${isModified ? "bg-yellow-100" : "bg-gray-100"} group-hover:bg-gray-200 shadow-[-1px_0_0_0_#e5e7eb] w-[60px]`}>'
);

fs.writeFileSync(file, content);
console.log('Fixed cell backgrounds!');
