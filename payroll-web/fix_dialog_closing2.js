const fs = require('fs');
let content = fs.readFileSync('src/components/ui/dialog.tsx', 'utf8');

// The exact string to replace is:
//       </DialogPrimitive.Popup>
//     </DialogPortal>

const toReplace = '      </DialogPrimitive.Popup>\r\n    </DialogPortal>';
const toReplaceUnix = '      </DialogPrimitive.Popup>\n    </DialogPortal>';

const replacement = `          </DialogPrimitive.Popup>
        </Draggable>
      </div>
    </DialogPortal>`;

if (content.includes(toReplace)) {
  content = content.replace(toReplace, replacement);
} else if (content.includes(toReplaceUnix)) {
  content = content.replace(toReplaceUnix, replacement);
}

fs.writeFileSync('src/components/ui/dialog.tsx', content);
