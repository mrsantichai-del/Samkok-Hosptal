const fs = require('fs');
const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The TableCell for actions looks like this:
// <TableCell>
//   <div className="flex items-center gap-2">
//     <Button variant="ghost" size="icon" ... onClick={() => openEditDialog(emp)}>

const regex = /<TableCell>\s*<div className="flex items-center gap-2">\s*<Button variant="ghost"/;
if (content.match(regex)) {
  content = content.replace(regex, '<TableCell className="print:hidden">\n                    <div className="flex items-center gap-2">\n                      <Button variant="ghost"');
  fs.writeFileSync(file, content);
  console.log('Fixed TableCell print:hidden');
} else {
  console.log('Regex failed for TableCell');
}

// Also wait, I see "นำเข้า Excel" and "เพิ่มพนักงานใหม่" were NOT hidden!
// Because my previous script only replaced the Export button.
// Let's hide them too.
content = content.replace(
  '<Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50" onClick={() => fileInputRef.current?.click()}>',
  '<Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 print:hidden" onClick={() => fileInputRef.current?.click()}>'
);

content = content.replace(
  '<Button className="bg-[#1877f2] hover:bg-[#166fe5]" onClick={openAddDialog}>',
  '<Button className="bg-[#1877f2] hover:bg-[#166fe5] print:hidden" onClick={openAddDialog}>'
);

fs.writeFileSync(file, content);
console.log('Fixed other buttons');

