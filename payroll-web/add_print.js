const fs = require('fs');

const file = 'src/app/dashboard/employees/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Printer to lucide-react imports
content = content.replace(
  'Download, Upload, ArrowUpDown } from "lucide-react";',
  'Download, Upload, ArrowUpDown, Printer } from "lucide-react";'
);

// 2. Add handlePrint function
const handlePrintStr = `
  const handlePrint = () => {
    window.print();
  };
`;
if (!content.includes('handlePrint')) {
  content = content.replace(
    'const handleSort = (key: string) => {',
    handlePrintStr + '\n  const handleSort = (key: string) => {'
  );
}

// 3. Add Print button next to Export button
const buttonRegex = /<Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick=\{handleExportExcel\}>/;
if (content.match(buttonRegex)) {
  content = content.replace(
    buttonRegex,
    '<Button variant="outline" className="text-gray-600 border-gray-600 hover:bg-gray-50 print:hidden" onClick={handlePrint}>\n            <Printer className="mr-2 h-4 w-4" /> พิมพ์รายงาน\n          </Button>\n          <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 print:hidden" onClick={handleExportExcel}>'
  );
}

// 4. Hide other header buttons and inputs during print
content = content.replace(
  '<div className="flex justify-between items-center mb-6">',
  '<div className="flex justify-between items-center mb-6 print:hidden">'
);
content = content.replace(
  '<div className="p-4 bg-white border-b flex items-center justify-between">',
  '<div className="p-4 bg-white border-b flex items-center justify-between print:hidden">'
);

// Hide the "จัดการ" column headers and cells
content = content.replace(
  '<TableHead className="w-[120px]">จัดการ</TableHead>',
  '<TableHead className="w-[120px] print:hidden">จัดการ</TableHead>'
);
content = content.replace(
  '<TableCell>\n                    <div className="flex items-center gap-2">\n                      <Button variant="ghost"',
  '<TableCell className="print:hidden">\n                    <div className="flex items-center gap-2">\n                      <Button variant="ghost"'
);

// Add the official print header at the very top of the page return
const printHeader = `
      {/* Official Print Header */}
      <div className="hidden print:block text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/logo.jpg" alt="Logo" className="w-16 h-16 object-contain" />
          <h1 className="text-2xl font-bold font-serif text-black">โรงพยาบาลสามโคก (Samkok Hospital)</h1>
        </div>
        <h2 className="text-xl font-bold font-serif text-black">รายงานข้อมูลบุคลากร</h2>
        <p className="text-black font-serif">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
`;
content = content.replace(
  '<div className="space-y-4 max-w-6xl mx-auto">',
  '<div className="space-y-4 max-w-6xl mx-auto print:max-w-none print:w-full">' + printHeader
);

// Make Table and Card borderless and print-friendly
content = content.replace(
  '<Card className="border-none shadow-sm rounded-lg overflow-hidden">',
  '<Card className="border-none shadow-sm rounded-lg overflow-hidden print:shadow-none print:rounded-none">'
);

// Convert all text in Table to black for printing
content = content.replace(
  '<Table className="bg-white">',
  '<Table className="bg-white print:text-black font-serif">'
);

fs.writeFileSync(file, content);
console.log('Added print button and official layout');
