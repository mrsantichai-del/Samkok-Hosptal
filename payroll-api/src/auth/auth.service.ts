import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    // Assign default role (Employee) if not specified (could be extended)
    const defaultRole = await this.prisma.role.findUnique({ where: { name: 'Employee' } });

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash: hashedPassword,
        email: dto.email,
        roles: defaultRole ? {
          create: {
            roleId: defaultRole.id
          }
        } : undefined
      },
    });

    return { message: 'User registered successfully', userId: user.id };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or user disabled');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userRoles = user.roles.map((r: any) => r.role.name);
    
    const payload = { 
      sub: user.id, 
      username: user.username,
      roles: userRoles
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      roles: userRoles
    };
  }
}
