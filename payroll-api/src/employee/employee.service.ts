import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip?: number, take?: number) {
    return this.prisma.employee.findMany({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
      where: { deletedAt: null },
      include: {
        position: true,
        department: true,
        employeeType: true,
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        position: true,
        department: true,
        employeeType: true,
        user: true,
      },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async create(createEmployeeDto: CreateEmployeeDto) {
    let employeeCode = createEmployeeDto.employeeCode;
    
    if (employeeCode) {
      const existing = await this.prisma.employee.findFirst({ where: { employeeCode, deletedAt: null } });
      if (existing) throw new BadRequestException('รหัสพนักงานนี้มีอยู่ในระบบแล้ว');
    } else {
      employeeCode = `EMP-${Date.now().toString().slice(-6)}`;
    }
    
    return this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        employeeCode,
      },
    });
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id); // ensure exists
    
    if (updateEmployeeDto.employeeCode) {
      const existing = await this.prisma.employee.findFirst({ 
        where: { employeeCode: updateEmployeeDto.employeeCode, id: { not: id }, deletedAt: null } 
      });
      if (existing) throw new BadRequestException('รหัสพนักงานนี้มีอยู่ในระบบแล้ว');
    }

    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id); // ensure exists
    
    // Soft delete
    const deleted = await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        action: 'SOFT_DELETE',
        tableName: 'Employee',
        recordId: id,
        userId: userId,
        reason: 'Deleted by user request via API',
      }
    });

    return { message: 'Employee deleted successfully' };
  }

  async getTypes() {
    return this.prisma.employeeType.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' }
    });
  }

  async createType(name: string, description?: string) {
    const existing = await this.prisma.employeeType.findFirst({ where: { name, deletedAt: null } });
    if (existing) throw new BadRequestException('ชื่อประเภทพนักงานนี้มีอยู่ในระบบแล้ว');
    return this.prisma.employeeType.create({
      data: { name, description }
    });
  }

  async updateType(id: string, data: { name?: string; description?: string }) {
    if (data.name) {
      const existing = await this.prisma.employeeType.findFirst({ where: { name: data.name, id: { not: id }, deletedAt: null } });
      if (existing) throw new BadRequestException('ชื่อประเภทพนักงานนี้มีอยู่ในระบบแล้ว');
    }
    return this.prisma.employeeType.update({
      where: { id },
      data
    });
  }

  async removeType(id: string) {
    return this.prisma.employeeType.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }


  async getDepartments() {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  async createDepartment(data: { name: string; description?: string }) {
    return this.prisma.department.create({ data });
  }

  async updateDepartment(id: string, data: { name?: string; description?: string }) {
    return this.prisma.department.update({ where: { id }, data });
  }

  async deleteDepartment(id: string) {
    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  
  async createUserAccount(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: { user: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');
    if (employee.user) throw new BadRequestException('User account already exists for this employee');

    // Make sure Employee role exists
    let employeeRole = await this.prisma.client.role.findFirst({
      where: { name: 'Employee', deletedAt: null }
    });

    if (!employeeRole) {
      employeeRole = await this.prisma.client.role.create({
        data: { name: 'Employee', description: 'General Employee' }
      });
    }

    const passwordHash = await bcrypt.hash(employee.employeeCode, 10);

    const newUser = await this.prisma.client.user.create({
      data: {
        username: employee.employeeCode,
        passwordHash,
        employeeId: employee.id,
        isActive: true,
      }
    });

    await this.prisma.client.userRole.create({
      data: {
        userId: newUser.id,
        roleId: employeeRole.id
      }
    });

    return { success: true, user: newUser };
  }

  async getPositions() {
    return this.prisma.position.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  async createPosition(name: string, description?: string) {
    const existing = await this.prisma.position.findFirst({ where: { name, deletedAt: null } });
    if (existing) throw new BadRequestException('ชื่อตำแหน่งนี้มีอยู่ในระบบแล้ว');
    return this.prisma.position.create({
      data: { name, description }
    });
  }

  async updatePosition(id: string, data: { name?: string; description?: string }) {
    if (data.name) {
      const existing = await this.prisma.position.findFirst({ where: { name: data.name, id: { not: id }, deletedAt: null } });
      if (existing) throw new BadRequestException('ชื่อตำแหน่งนี้มีอยู่ในระบบแล้ว');
    }
    return this.prisma.position.update({
      where: { id },
      data
    });
  }

  async removePosition(id: string) {
    return this.prisma.position.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
