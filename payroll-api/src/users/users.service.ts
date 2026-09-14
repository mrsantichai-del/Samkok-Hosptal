import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

const DEFAULT_ROLE_DESCRIPTIONS: Record<string, string> = {
  'System Administrator': 'ผู้ดูแลระบบสูงสุด ได้รับอนุญาตให้เข้าถึงและจัดการได้ทุกโมดูล 100% (ดู, สร้าง, แก้ไข, ลบ, อนุมัติ, ส่งออกข้อมูล) จัดการบัญชีผู้ใช้ รีเซ็ตรหัสผ่าน กำหนดกลุ่มสิทธิ์ โครงสร้างกลุ่มงาน ตำแหน่งงาน ประเภทบุคลากร สูตรคำนวณเงินเดือน และตั้งค่าโรงพยาบาลสำหรับออกเอกสารราชการ สามารถสลับดูสลิปเงินเดือนและใบ 50 ทวิของพนักงานทุกคนได้โดยไม่จำเป็นต้องเป็นพนักงาน',
  'Admin': 'ผู้ดูแลระบบ ได้รับอนุญาตให้เข้าถึงและจัดการได้ทุกโมดูล 100% จัดการบัญชีผู้ใช้ กำหนดกลุ่มสิทธิ์ โครงสร้างองค์กร และตั้งค่าระบบ',
  'Executive': 'ผู้บริหาร / ผู้อำนวยการโรงพยาบาล เข้าถึงแดชบอร์ดภาพรวมค่าใช้จ่ายเงินเดือนหลายมิติ (Executive Analytics) ตรวจสอบรายงานเชิงลึก (Drill-down) ทุกมิติ ตรวจสอบยอดและกด "อนุมัติจ่าย" หรือ "ส่งกลับแก้ไข" รอบการจ่ายเงินเดือน เรียกดูและส่งออกศูนย์รวมรายงาน (Reports) และเรียกดูสลิปเงินเดือน & 50 ทวิของตนเอง (ไม่มีสิทธิ์แก้ไขข้อมูลพนักงาน สูตรคำนวณ หรือตั้งค่าระบบ)',
  'HR': 'เจ้าหน้าที่ทรัพยากรบุคคลและการเงิน จัดการทะเบียนประวัติพนักงานทั้งหมด (เพิ่ม/แก้ไข/บันทึกเลขบัตร ปชช. 13 หลัก/ฐานเงินเดือน/นำเข้า Excel) ประมวลผลและคำนวณเงินเดือนอัตโนมัติ บันทึกค่าเวร/OT ส่งขออนุมัติจ่ายเงินเดือน ออกรายงานสรุปนำส่งธนาคาร สรรพากร สปส. กบข. ออกหนังสือรับรองการหักภาษี 50 ทวิให้แก่พนักงานทุกคน และเรียกดูสลิปของตนเอง',
  'Finance Officer': 'เจ้าหน้าที่การเงินและบัญชี จัดการคำนวณเงินเดือน บันทึกค่าตอบแทน/รายการหัก ตรวจสอบรายงานการเงิน นำส่งภาษี ประกันสังคม กองทุน กบข./กสจ. ออกหนังสือรับรอง 50 ทวิ และเรียกดูสลิปของตนเอง',
  'Employee': 'บุคลากรทั่วไป (Employee Self-Service) มีสิทธิ์เข้าถึงเฉพาะเมนู "สลิปของฉัน & 50 ทวิ" เพื่อเรียกดูสลิปเงินเดือนย้อนหลังในแต่ละงวด สั่งพิมพ์ใบจ่ายเงินเดือน (Payslip) เรียกดูและสั่งพิมพ์หนังสือรับรองการหักภาษี ณ ที่จ่าย (ใบ 50 ทวิ) ของตนเอง ตรวจสอบยอดสะสมประจำปี (YTD) และเปลี่ยนรหัสผ่านของตนเอง โดยถูกจำกัดสิทธิ์ไม่ให้เห็นข้อมูลของผู้อื่น และไม่สามารถเข้าถึงโมดูลอื่นๆ ในระบบได้'
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.user.findMany({
      where: { deletedAt: null },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
            employeeType: true
          }
        },
        roles: {
          include: { role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ==========================================
  // ROLES / USER GROUPS MANAGEMENT
  // ==========================================
  async getRoles() {
    const roles = await this.prisma.client.role.findMany({
      where: { deletedAt: null },
      include: {
        users: {
          where: { deletedAt: null, user: { deletedAt: null } },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                isActive: true,
                imgUrl: true,
                employee: {
                  select: {
                    id: true,
                    employeeCode: true,
                    firstName: true,
                    lastName: true,
                    department: { select: { name: true } },
                    position: { select: { name: true } }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Enhance with default descriptions if missing
    return roles.map(r => {
      const defaultDesc = DEFAULT_ROLE_DESCRIPTIONS[r.name] || '';
      return {
        ...r,
        description: r.description || defaultDesc,
        userCount: r.users.length
      };
    });
  }

  async getRole(id: string) {
    const role = await this.prisma.client.role.findUnique({
      where: { id, deletedAt: null },
      include: {
        users: {
          where: { deletedAt: null, user: { deletedAt: null } },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                isActive: true,
                imgUrl: true,
                employee: {
                  select: {
                    id: true,
                    employeeCode: true,
                    firstName: true,
                    lastName: true,
                    department: { select: { name: true } },
                    position: { select: { name: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!role) throw new NotFoundException('ไม่พบกลุ่มผู้ใช้งานนี้');

    return {
      ...role,
      description: role.description || DEFAULT_ROLE_DESCRIPTIONS[role.name] || '',
      userCount: role.users.length
    };
  }

  async createRole(data: { name: string; description?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('กรุณาระบุชื่อกลุ่มผู้ใช้งาน');
    }

    const trimmedName = data.name.trim();
    const existing = await this.prisma.client.role.findFirst({
      where: { name: trimmedName, deletedAt: null }
    });

    if (existing) {
      throw new BadRequestException(`ชื่อกลุ่มผู้ใช้งาน "${trimmedName}" มีอยู่ในระบบแล้ว`);
    }

    return this.prisma.client.role.create({
      data: {
        name: trimmedName,
        description: data.description?.trim() || DEFAULT_ROLE_DESCRIPTIONS[trimmedName] || null
      }
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string }) {
    const role = await this.prisma.client.role.findUnique({ where: { id, deletedAt: null } });
    if (!role) throw new NotFoundException('ไม่พบกลุ่มผู้ใช้งานนี้');

    const updateData: any = {};
    if (data.name && data.name.trim() !== role.name) {
      const trimmedName = data.name.trim();
      const existing = await this.prisma.client.role.findFirst({
        where: { name: trimmedName, deletedAt: null, id: { not: id } }
      });
      if (existing) {
        throw new BadRequestException(`ชื่อกลุ่มผู้ใช้งาน "${trimmedName}" มีอยู่ในระบบแล้ว`);
      }
      updateData.name = trimmedName;
    }

    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }

    return this.prisma.client.role.update({
      where: { id },
      data: updateData
    });
  }

  async removeRole(id: string) {
    const role = await this.prisma.client.role.findUnique({
      where: { id, deletedAt: null },
      include: { users: { where: { deletedAt: null, user: { deletedAt: null } } } }
    });

    if (!role) throw new NotFoundException('ไม่พบกลุ่มผู้ใช้งานนี้');

    if (role.users.length > 0) {
      throw new BadRequestException(`ไม่สามารถลบกลุ่ม "${role.name}" ได้เนื่องจากมีผู้ใช้งานอยู่ในกลุ่มนี้ ${role.users.length} บัญชี กรุณาย้ายผู้ใช้งานไปกลุ่มอื่นก่อนลบ`);
    }

    if (['System Administrator', 'Admin', 'HR', 'Executive', 'Employee'].includes(role.name)) {
      throw new BadRequestException(`กลุ่ม "${role.name}" เป็นกลุ่มหลักของระบบ ไม่สามารถลบได้`);
    }

    await this.prisma.client.role.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return { message: 'ลบกลุ่มผู้ใช้งานสำเร็จ' };
  }

  // ==========================================
  // USERS MANAGEMENT
  // ==========================================
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
