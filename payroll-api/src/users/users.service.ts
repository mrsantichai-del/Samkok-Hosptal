import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  async getNotifications(userId: string, roles: string[]) {
    // Get notifications where userId is null (global), or userId matches, or roleName matches
    const notifs = await this.prisma.notification.findMany({
      where: {
        OR: [
          { userId: null, roleName: null }, // global
          { userId: userId },               // direct
          { roleName: { in: roles } }       // role based
        ],
        isRead: false
      },
      orderBy: { createdAt: 'desc' }
    });
    return notifs;
  }

  async markAllNotificationsRead(userId: string) {
    // This is a bit tricky because global notifications can't be marked read for everyone if just one reads it.
    // Ideally we need a NotificationRead table, but for now we just mark the ones directly for the user as read.
    // Or we just delete them?
    // Let's just mark the ones that have userId = this user.
    await this.prisma.notification.updateMany({
      where: { userId: userId },
      data: { isRead: true }
    });
    return { success: true };
  }

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.user.findMany({
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
    return this.prisma.client.role.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
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
    const existing = await this.prisma.client.user.findUnique({ where: { username: createUserDto.username } });
    if (existing) throw new BadRequestException('Username already exists');

    if (createUserDto.employeeId) {
      const empLinked = await this.prisma.client.user.findUnique({ where: { employeeId: createUserDto.employeeId } });
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

    const user = await this.prisma.client.user.create({ data });

    if (createUserDto.roles && createUserDto.roles.length > 0) {
      const roleData = createUserDto.roles.map(roleId => ({
        userId: user.id,
        roleId,
      }));
      await this.prisma.client.userRole.createMany({ data: roleData });
    }

    return this.findOne(user.id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.client.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existing = await this.prisma.client.user.findUnique({ where: { username: updateUserDto.username } });
      if (existing) throw new BadRequestException('Username already exists');
    }

    if (updateUserDto.employeeId && updateUserDto.employeeId !== user.employeeId) {
      const empLinked = await this.prisma.client.user.findUnique({ where: { employeeId: updateUserDto.employeeId } });
      if (empLinked) throw new BadRequestException('This employee is already linked to another user account');
    }

    const data: any = {};
    if (updateUserDto.username) data.username = updateUserDto.username;
    if (updateUserDto.email !== undefined) data.email = updateUserDto.email;
    if (updateUserDto.isActive !== undefined) data.isActive = updateUserDto.isActive;
    if (updateUserDto.employeeId !== undefined) data.employeeId = updateUserDto.employeeId;
    if ((updateUserDto as any).imgUrl !== undefined) data.imgUrl = (updateUserDto as any).imgUrl;
    if ((updateUserDto as any).signatureUrl !== undefined) data.signatureUrl = (updateUserDto as any).signatureUrl;
    
    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.prisma.client.$transaction(async (tx: any) => {
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
    const user = await this.prisma.client.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.client.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });

    return { message: 'User deleted successfully' };
  }
}
