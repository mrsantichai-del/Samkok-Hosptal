"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let EmployeeService = class EmployeeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(skip, take) {
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
    async findOne(id) {
        const employee = await this.prisma.employee.findFirst({
            where: { id, deletedAt: null },
            include: {
                position: true,
                department: true,
                employeeType: true,
                user: true,
            },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        return employee;
    }
    async create(createEmployeeDto) {
        let employeeCode = createEmployeeDto.employeeCode;
        if (employeeCode) {
            const existing = await this.prisma.employee.findFirst({ where: { employeeCode, deletedAt: null } });
            if (existing)
                throw new common_1.BadRequestException('รหัสพนักงานนี้มีอยู่ในระบบแล้ว');
        }
        else {
            employeeCode = `EMP-${Date.now().toString().slice(-6)}`;
        }
        return this.prisma.employee.create({
            data: {
                ...createEmployeeDto,
                employeeCode,
            },
        });
    }
    async update(id, updateEmployeeDto) {
        await this.findOne(id);
        if (updateEmployeeDto.employeeCode) {
            const existing = await this.prisma.employee.findFirst({
                where: { employeeCode: updateEmployeeDto.employeeCode, id: { not: id }, deletedAt: null }
            });
            if (existing)
                throw new common_1.BadRequestException('รหัสพนักงานนี้มีอยู่ในระบบแล้ว');
        }
        return this.prisma.employee.update({
            where: { id },
            data: updateEmployeeDto,
        });
    }
    async remove(id, userId) {
        await this.findOne(id);
        const deleted = await this.prisma.employee.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
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
    async createType(name, description) {
        const existing = await this.prisma.employeeType.findFirst({ where: { name, deletedAt: null } });
        if (existing)
            throw new common_1.BadRequestException('ชื่อประเภทพนักงานนี้มีอยู่ในระบบแล้ว');
        return this.prisma.employeeType.create({
            data: { name, description }
        });
    }
    async updateType(id, data) {
        if (data.name) {
            const existing = await this.prisma.employeeType.findFirst({ where: { name: data.name, id: { not: id }, deletedAt: null } });
            if (existing)
                throw new common_1.BadRequestException('ชื่อประเภทพนักงานนี้มีอยู่ในระบบแล้ว');
        }
        return this.prisma.employeeType.update({
            where: { id },
            data
        });
    }
    async removeType(id) {
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
    async createDepartment(data) {
        return this.prisma.department.create({ data });
    }
    async updateDepartment(id, data) {
        return this.prisma.department.update({ where: { id }, data });
    }
    async deleteDepartment(id) {
        return this.prisma.department.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
    async createUserAccount(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id, deletedAt: null },
            include: { user: true }
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (employee.user)
            throw new common_1.BadRequestException('User account already exists for this employee');
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
    async createPosition(name, description) {
        const existing = await this.prisma.position.findFirst({ where: { name, deletedAt: null } });
        if (existing)
            throw new common_1.BadRequestException('ชื่อตำแหน่งนี้มีอยู่ในระบบแล้ว');
        return this.prisma.position.create({
            data: { name, description }
        });
    }
    async updatePosition(id, data) {
        if (data.name) {
            const existing = await this.prisma.position.findFirst({ where: { name: data.name, id: { not: id }, deletedAt: null } });
            if (existing)
                throw new common_1.BadRequestException('ชื่อตำแหน่งนี้มีอยู่ในระบบแล้ว');
        }
        return this.prisma.position.update({
            where: { id },
            data
        });
    }
    async removePosition(id) {
        return this.prisma.position.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map