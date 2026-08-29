const fs = require('fs');
const file = 'src/app/dashboard/payroll/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace <Table with <table
content = content.replace(
  '<Table className="border-collapse h-max" style={{ width: \'max-content\' }}>',
  '<table className="border-collapse h-max w-full text-sm" style={{ width: \'max-content\' }}>'
);
content = content.replace(
  '</Table>',
  '</table>'
);

// Also we should verify the wrapper logic
// If `div.overflow-auto` is the scroll container, its children (`table`) will stick.
// Wait, `sticky bottom-[-1px]` on `TableFooter`!
// Shadcn `TableFooter` renders as `<tfoot className="...">`.
// It will stick to `div.overflow-auto` if its bottom touches the bottom of `div.overflow-auto`.
// But `div.overflow-auto flex-1 pb-4` has `pb-4`! So the bottom is 16px above the actual edge.
// If we use `bottom-0` on `tfoot`, it will stick 16px from the actual bottom border because of `pb-4`.
// Let's remove `pb-4` from the wrapper, or change it so the footer sticks flush.
content = content.replace(
  '<div className="overflow-auto flex-1 pb-4">',
  '<div className="overflow-auto flex-1 relative">'
);

// And make sure TableFooter sticky class is top notch
content = content.replace(
  '<TableFooter className="sticky bottom-[-1px] z-40 bg-gray-200 font-bold shadow-[0_-1px_0_0_#d1d5db]">',
  '<TableFooter className="sticky bottom-0 z-40 bg-gray-200 font-bold shadow-[0_-1px_0_0_#d1d5db]">'
);

fs.writeFileSync(file, content);
