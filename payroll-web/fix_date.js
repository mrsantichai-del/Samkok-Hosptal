const fs = require('fs');
let file = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { format } from "date-fns";\nimport { th } from "date-fns/locale";\n', '');
content = content.replace(
  '{format(new Date(notif.createdAt), "d MMM yyyy HH:mm", { locale: th })}',
  '{new Date(notif.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}'
);

fs.writeFileSync(file, content);
console.log('Fixed date formatting');
