const fs = require('fs');
const file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix container height so it doesn't cause `main` to scroll
content = content.replace(
  'className="flex flex-col h-[calc(100vh-60px)] px-2 pb-2"',
  'className="flex flex-col h-[calc(100vh-120px)] px-2 pb-2"'
);

// 2. Add top-0 to the first 4 sticky-left columns
content = content.replace(
  'sticky left-0 z-50 bg-gray-200',
  'sticky left-0 top-0 z-50 bg-gray-200'
);
content = content.replace(
  'sticky left-[30px] z-50 bg-gray-200',
  'sticky left-[30px] top-0 z-50 bg-gray-200'
);
content = content.replace(
  'sticky left-[180px] z-50 bg-gray-200',
  'sticky left-[180px] top-0 z-50 bg-gray-200'
);
content = content.replace(
  'sticky left-[260px] z-50 bg-gray-200',
  'sticky left-[260px] top-0 z-50 bg-gray-200'
);

// 3. Add sticky top-0 to the group headers (รายรับ, รายจ่าย, รับสุทธิ)
content = content.replace(
  'className="border border-gray-300 p-1 text-center text-green-900 bg-green-200/90 font-bold z-40 text-xs"',
  'className="border border-gray-300 p-1 text-center text-green-900 bg-green-200/90 font-bold sticky top-0 z-40 text-xs"'
);
content = content.replace(
  'className="border border-gray-300 p-1 text-center text-red-900 bg-red-200/90 font-bold z-40 text-xs"',
  'className="border border-gray-300 p-1 text-center text-red-900 bg-red-200/90 font-bold sticky top-0 z-40 text-xs"'
);
content = content.replace(
  'className="border border-gray-300 p-1 text-center sticky right-0 z-50 bg-gray-200 min-w-[100px] w-[100px] shadow-[-1px_0_0_0_#d1d5db] font-bold"',
  'className="border border-gray-300 p-1 text-center sticky right-0 top-0 z-50 bg-gray-200 min-w-[100px] w-[100px] shadow-[-1px_0_0_0_#d1d5db] font-bold"'
);

fs.writeFileSync(file, content);
