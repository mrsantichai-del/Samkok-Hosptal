import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Get, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('settings')
export class SettingsController {
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Administrator', 'Finance Officer')
  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => cb(null, 'logo' + extname(file.originalname))
    })
  }))
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return { message: 'Logo uploaded successfully', path: file.path };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('System Administrator', 'Finance Officer')
  @Post('upload-signature')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => cb(null, 'signature' + extname(file.originalname))
    })
  }))
  uploadSignature(@UploadedFile() file: Express.Multer.File) {
    return { message: 'Signature uploaded successfully', path: file.path };
  }

  @Get('logo')
  getLogo(@Res() res: Response) {
    const exts = ['.png', '.jpg', '.jpeg'];
    for (const ext of exts) {
      const p = join(process.cwd(), 'uploads', 'logo' + ext);
      if (fs.existsSync(p)) return res.sendFile(p);
    }
    return res.status(404).send('Not found');
  }

  @Get('signature')
  getSignature(@Res() res: Response) {
    const exts = ['.png', '.jpg', '.jpeg'];
    for (const ext of exts) {
      const p = join(process.cwd(), 'uploads', 'signature' + ext);
      if (fs.existsSync(p)) return res.sendFile(p);
    }
    return res.status(404).send('Not found');
  }
}
