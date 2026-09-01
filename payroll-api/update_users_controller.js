const fs = require('fs');

const file = 'src/users/users.controller.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { UseInterceptors, UploadedFile, BadRequestException }')) {
  content = content.replace(
    "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';",
    "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';"
  );
}

if (!content.includes("import { FileInterceptor }")) {
  content = content.replace(
    "import { Roles } from '../auth/decorators/roles.decorator';",
    "import { Roles } from '../auth/decorators/roles.decorator';\nimport { FileInterceptor } from '@nestjs/platform-express';\nimport { createClient } from '@supabase/supabase-js';\nimport { extname } from 'path';"
  );
}

if (!content.includes("const supabase = createClient(")) {
  const insertIndex = content.indexOf('@ApiTags');
  content = content.slice(0, insertIndex) + `const supabase = createClient(
  process.env.SUPABASE_URL || 'https://wjjewbltlwvsqljeazlz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamV3Ymx0bHd2c3FsamVhemx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczOTkxNCwiZXhwIjoyMTAzMzE1OTE0fQ.j2TyaPGhFOIvoO7RhO7i6CKJspjMoia4gMPJ5VVMKH4'
);\n\n` + content.slice(insertIndex);
}

const newEndpoints = `
  @Roles('System Administrator')
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload user profile image' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = extname(file.originalname);
    const fileName = \`profile_\${id}\${ext}\`;
    
    const { error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
      upsert: true,
      contentType: file.mimetype
    });
    if (error) throw new BadRequestException('Upload failed: ' + error.message);
    
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return this.usersService.update(id, { imgUrl: urlData.publicUrl } as any);
  }

  @Roles('System Administrator')
  @Post(':id/upload-signature')
  @ApiOperation({ summary: 'Upload user signature' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSignature(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = extname(file.originalname);
    const fileName = \`sig_\${id}\${ext}\`;
    
    const { error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
      upsert: true,
      contentType: file.mimetype
    });
    if (error) throw new BadRequestException('Upload failed: ' + error.message);
    
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return this.usersService.update(id, { signatureUrl: urlData.publicUrl } as any);
  }
`;

if (!content.includes('uploadImage(')) {
  content = content.replace('export class UsersController {', 'export class UsersController {' + newEndpoints);
}

fs.writeFileSync(file, content);
console.log("Updated users.controller.ts");
