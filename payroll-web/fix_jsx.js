const fs = require('fs');
let file = 'src/app/dashboard/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/src=`(.*?)`/g, 'src={`$1`}');
fs.writeFileSync(file, content);
