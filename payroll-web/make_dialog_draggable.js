const fs = require('fs');

const file = 'src/components/ui/dialog.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Draggable import
content = content.replace(
  'import { XIcon } from "lucide-react"',
  'import { XIcon } from "lucide-react"\nimport Draggable from "react-draggable"'
);

// 2. Modify DialogOverlay (Remove blur and bg-black/10, make it transparent)
content = content.replace(
  '"fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"',
  '"fixed inset-0 isolate z-40 bg-transparent"'
);

// 3. Modify DialogContent to use Draggable and Flex centering
const oldContent = `function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}`;

const newContent = `function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  const nodeRef = React.useRef(null);
  return (
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <Draggable nodeRef={nodeRef} handle=".dialog-drag-handle">
          <DialogPrimitive.Popup
            ref={nodeRef}
            data-slot="dialog-content"
            className={cn(
              "pointer-events-auto grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm shadow-2xl",
              className
            )}
            {...props}
          >
            {children}`;

content = content.replace(oldContent, newContent);

// Add closing tags for the new wrapper div
content = content.replace(
  '      </DialogPrimitive.Popup>\n    </DialogPortal>',
  '          </DialogPrimitive.Popup>\n        </Draggable>\n      </div>\n    </DialogPortal>'
);

// 4. Modify DialogHeader to add drag handle class and cursor
content = content.replace(
  'className={cn("flex flex-col gap-2", className)}',
  'className={cn("flex flex-col gap-2 dialog-drag-handle cursor-move select-none", className)}'
);

fs.writeFileSync(file, content);
