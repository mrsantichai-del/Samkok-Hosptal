const fs = require('fs');

const file = 'src/users/users.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const uploadImagePatch = `
    const user = await this.usersService.findOne(id);
    if (user?.imgUrl) {
      const parts = user.imgUrl.split('/');
      const oldFileName = parts[parts.length - 1];
      await supabase.storage.from('uploads').remove([oldFileName]);
    }
    const { error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
`;

const uploadSignaturePatch = `
    const user = await this.usersService.findOne(id);
    if (user?.signatureUrl) {
      const parts = user.signatureUrl.split('/');
      const oldFileName = parts[parts.length - 1];
      await supabase.storage.from('uploads').remove([oldFileName]);
    }
    const { error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
`;

content = content.replace(
  "const { error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {",
  uploadImagePatch
);

// Second replace for signature
content = content.replace(
  "const { error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {",
  uploadSignaturePatch
);

fs.writeFileSync(file, content);
console.log("Updated users.controller.ts to delete old files on upload");
