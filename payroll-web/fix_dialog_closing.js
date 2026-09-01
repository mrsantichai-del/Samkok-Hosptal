const fs = require('fs');

const file = 'src/components/ui/dialog.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the specific closing tags sequence
content = content.replace(
  /      <\/DialogPrimitive\.Popup>\n    <\/DialogPortal>/,
  \`          </DialogPrimitive.Popup>
        </Draggable>
      </div>
    </DialogPortal>\`
);

fs.writeFileSync(file, content);
