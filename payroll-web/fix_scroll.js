const fs = require('fs');
const file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the main wrapper div to use fixed positioning
content = content.replace(
  '<div className="flex flex-col h-[calc(100vh-120px)] px-2 pb-2">',
  '<div className="fixed top-14 left-0 lg:left-[280px] right-0 bottom-0 bg-[#f0f2f5] flex flex-col p-2 lg:p-4 z-30">'
);

// We should also remove sticky top-0 from TableHeader, because it might conflict with the individual TableHead sticky top-0
// Wait, actually, let's keep it, but ensure z-indexes are correct.
// The first row has z-50 and z-40. The second row has z-40.
// Let's change top-[28px] to top-[25px] to avoid the gap.
content = content.replace(/sticky top-\[28px\]/g, 'sticky top-[25px]');

fs.writeFileSync(file, content);
