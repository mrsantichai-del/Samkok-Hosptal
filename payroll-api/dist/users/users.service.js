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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async findOne(id) {
        const user = await this.prisma.client.user.findUnique({
            where: { id, deletedAt: null },
            include: {
                employee: true,
                roles: { include: { role: true } }
            }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async create(createUserDto) {
        const existing = await this.prisma.client.user.findUnique({ where: { username: createUserDto.username } });
        if (existing)
            throw new common_1.BadRequestException('Username already exists');
        if (createUserDto.employeeId) {
            const empLinked = await this.prisma.client.user.findUnique({ where: { employeeId: createUserDto.employeeId } });
            if (empLinked)
                throw new common_1.BadRequestException('This employee is already linked to another user account');
        }
        const passwordHash = await bcrypt.hash(createUserDto.password, 10);
        const data = {
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
    async update(id, updateUserDto) {
        const user = await this.prisma.client.user.findUnique({ where: { id, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existing = await this.prisma.client.user.findUnique({ where: { username: updateUserDto.username } });
            if (existing)
                throw new common_1.BadRequestException('Username already exists');
        }
        if (updateUserDto.employeeId && updateUserDto.employeeId !== user.employeeId) {
            const empLinked = await this.prisma.client.user.findUnique({ where: { employeeId: updateUserDto.employeeId } });
            if (empLinked)
                throw new common_1.BadRequestException('This employee is already linked to another user account');
        }
        const data = {};
        if (updateUserDto.username)
            data.username = updateUserDto.username;
        if (updateUserDto.email !== undefined)
            data.email = updateUserDto.email;
        if (updateUserDto.isActive !== undefined)
            data.isActive = updateUserDto.isActive;
        if (updateUserDto.employeeId !== undefined)
            data.employeeId = updateUserDto.employeeId;
        if (updateUserDto.imgUrl !== undefined)
            data.imgUrl = updateUserDto.imgUrl;
        if (updateUserDto.signatureUrl !== undefined)
            data.signatureUrl = updateUserDto.signatureUrl;
        if (updateUserDto.password) {
            data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
        }
        await this.prisma.client.$transaction(async (tx) => {
            await tx.user.update({ where: { id }, data });
            if (updateUserDto.roles) {
                await tx.userRole.deleteMany({ where: { userId: id } });
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
    async remove(id) {
        const user = await this.prisma.client.user.findUnique({ where: { id, deletedAt: null } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.client.user.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false }
        });
        return { message: 'User deleted successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map