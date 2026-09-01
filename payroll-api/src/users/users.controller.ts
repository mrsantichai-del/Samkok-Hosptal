import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { createClient } from '@supabase/supabase-js';
import { extname } from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://wjjewbltlwvsqljeazlz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamV3Ymx0bHd2c3FsamVhemx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczOTkxNCwiZXhwIjoyMTAzMzE1OTE0fQ.j2TyaPGhFOIvoO7RhO7i6CKJspjMoia4gMPJ5VVMKH4'
);

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  @Roles('System Administrator')
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload user profile image' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = extname(file.originalname);
    const fileName = `profile_${id}${ext}`;
    
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
    const fileName = `sig_${id}${ext}`;
    
    const { error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
      upsert: true,
      contentType: file.mimetype
    });
    if (error) throw new BadRequestException('Upload failed: ' + error.message);
    
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    return this.usersService.update(id, { signatureUrl: urlData.publicUrl } as any);
  }

  constructor(private readonly usersService: UsersService) {}

  @Roles('System Administrator')
  @Get('roles')
  @ApiOperation({ summary: 'Get all available roles' })
  getRoles() {
    return this.usersService.getRoles();
  }

  @Roles('System Administrator')
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Roles('System Administrator')
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles('System Administrator')
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles('System Administrator')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles('System Administrator')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
