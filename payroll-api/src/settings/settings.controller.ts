import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Get, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://wjjewbltlwvsqljeazlz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamV3Ymx0bHd2c3FsamVhemx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczOTkxNCwiZXhwIjoyMTAzMzE1OTE0fQ.j2TyaPGhFOIvoO7RhO7i6CKJspjMoia4gMPJ5VVMKH4'
);

@Controller('settings')
export class SettingsController {
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Administrator', 'Finance Officer')
  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file')) // Uses memoryStorage by default
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    
    const ext = extname(file.originalname);
    const fileName = `logo${ext}`;
    
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
      upsert: true,
      contentType: file.mimetype
    });

    if (error) throw new BadRequestException('Failed to upload to Supabase: ' + error.message);

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return { message: 'Logo uploaded successfully', path: urlData.publicUrl };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Administrator', 'Finance Officer')
  @Post('upload-signature')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSignature(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    
    const ext = extname(file.originalname);
    const fileName = `signature${ext}`;
    
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
      upsert: true,
      contentType: file.mimetype
    });

    if (error) throw new BadRequestException('Failed to upload to Supabase: ' + error.message);

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return { message: 'Signature uploaded successfully', path: urlData.publicUrl };
  }

  // Redirect the old endpoints to public URL
  @Get('logo')
  async getLogo(@Res() res: Response) {
    // List files to find logo with its extension
    const { data, error } = await supabase.storage.from('uploads').list();
    if (error || !data) return res.status(404).send('Not found');
    
    const logoFile = data.find(f => f.name.startsWith('logo.'));
    if (!logoFile) return res.status(404).send('Not found');

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(logoFile.name);
    return res.redirect(urlData.publicUrl);
  }

  @Get('signature')
  async getSignature(@Res() res: Response) {
    const { data, error } = await supabase.storage.from('uploads').list();
    if (error || !data) return res.status(404).send('Not found');
    
    const signatureFile = data.find(f => f.name.startsWith('signature.'));
    if (!signatureFile) return res.status(404).send('Not found');

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(signatureFile.name);
    return res.redirect(urlData.publicUrl);
  }
}
