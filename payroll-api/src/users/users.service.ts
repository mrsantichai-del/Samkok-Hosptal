import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        employee: true,
        roles: {
          include: { role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getRoles() {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        employee: true,
        roles: { include: { role: true } }
      }
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { username: createUserDto.username } });
    if (existing) throw new BadRequestException('Username already exists');

    if (createUserDto.employeeId) {
      const empLinked = await this.prisma.user.findUnique({ where: { employeeId: createUserDto.employeeId } });
      if (empLinked) throw new BadRequestException('This employee is already linked to another user account');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const data: any = {
      username: createUserDto.username,
      passwordHash,
      email: createUserDto.email,
      isActive: createUserDto.isActive ?? true,
      employeeId: createUserDto.employeeId,
    };

    const user = await this.prisma.user.create({ data });

    if (createUserDto.roles && createUserDto.roles.length > 0) {
      const roleData = createUserDto.roles.map(roleId => ({
        userId: user.id,
        roleId,
      }));
      await this.prisma.userRole.createMany({ data: roleData });
    }

    return this.findOne(user.id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existing = await this.prisma.user.findUnique({ where: { username: updateUserDto.username } });
      if (existing) throw new BadRequestException('Username already exists');
    }

    if (updateUserDto.employeeId && updateUserDto.employeeId !== user.employeeId) {
      const empLinked = await this.prisma.user.findUnique({ where: { employeeId: updateUserDto.employeeId } });
      if (empLinked) throw new BadRequestException('This employee is already linked to another user account');
    }

    const data: any = {};
    if (updateUserDto.username) data.username = updateUserDto.username;
    if (updateUserDto.email !== undefined) data.email = updateUserDto.email;
    if (updateUserDto.isActive !== undefined) data.isActive = updateUserDto.isActive;
    if (updateUserDto.employeeId !== undefined) data.employeeId = updateUserDto.employeeId;
    
    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data });

      if (updateUserDto.roles) {
        // Delete old roles
        await tx.userRole.deleteMany({ where: { userId: id } });
        
        // Add new roles
        if (updateUserDto.roles.length > 0) {
          const roleData = updateUserDto.roles.map(roleId => ({
            userId: id,
            roleId,
          }));
          await tx.userRole.createMany({ data: roleData });
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });

    return { message: 'User deleted successfully' };
  }
}
