const fs = require('fs');
const file = 'src/users/users.controller.ts';
let content = fs.readFileSync(file, 'utf8');

// The method got messed up. Let's just recreate the entire file properly.
// I will just use regex to fix the duplicate `const user` in `uploadImage`.
content = content.replace(
  `
      const user = await this.usersService.findOne(id);
      if (user?.signatureUrl) {
        const parts = user.signatureUrl.split('/');
        const oldFileName = parts[parts.length - 1];
        await supabase.storage.from('uploads').remove([oldFileName]);
      }
`,
  ''
);

fs.writeFileSync(file, content);
console.log('Fixed users.controller.ts');
