const fs = require('fs');

const file = 'src/components/ui/dialog.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /function DialogContent\([\s\S]*?\{children\}\s*/;
const match = content.match(regex);
if (match) {
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
              "pointer-events-auto grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-2xl duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className
            )}
            {...props}
          >
            {children}
`;
  content = content.replace(regex, newContent);
}

// Fix the closing tags for DialogPrimitive.Popup
content = content.replace(
  /      <\/DialogPrimitive\.Popup>\n    <\/DialogPortal>/,
  `          </DialogPrimitive.Popup>
        </Draggable>
      </div>
    </DialogPortal>`
);

fs.writeFileSync(file, content);
