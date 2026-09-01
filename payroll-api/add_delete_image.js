const fs = require('fs');

const file = 'src/users/users.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const newMethods = `
  @Roles('System Administrator')
  @Delete(':id/image')
  @ApiOperation({ summary: 'Delete user profile image' })
  async deleteImage(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (user?.imgUrl) {
      const parts = user.imgUrl.split('/');
      const fileName = parts[parts.length - 1];
      await supabase.storage.from('uploads').remove([fileName]);
      return this.usersService.update(id, { imgUrl: null } as any);
    }
    return { message: 'No image to delete' };
  }

  @Roles('System Administrator')
  @Delete(':id/signature')
  @ApiOperation({ summary: 'Delete user signature' })
  async deleteSignature(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (user?.signatureUrl) {
      const parts = user.signatureUrl.split('/');
      const fileName = parts[parts.length - 1];
      await supabase.storage.from('uploads').remove([fileName]);
      return this.usersService.update(id, { signatureUrl: null } as any);
    }
    return { message: 'No signature to delete' };
  }
`;

if (!content.includes('deleteImage(')) {
  const insertIndex = content.lastIndexOf('}');
  content = content.slice(0, insertIndex) + newMethods + '\n' + content.slice(insertIndex);
  fs.writeFileSync(file, content);
}
console.log('Added delete methods to users.controller.ts');
