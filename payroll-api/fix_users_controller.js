const fs = require('fs');
let file = 'src/users/users.controller.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix the import issue
content = content.replace(
  "@Controller('users')\nimport { Req } from '@nestjs/common';",
  "@Controller('users')"
);

// add it to the top
content = "import { Req } from '@nestjs/common';\n" + content;

fs.writeFileSync(file, content);
console.log('Fixed users.controller.ts');
