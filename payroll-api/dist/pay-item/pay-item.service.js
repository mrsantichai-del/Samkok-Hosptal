"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayItemService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayItemService = class PayItemService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.payItem.findMany({
            where: { deletedAt: null },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' }
            ]
        });
    }
    async findOne(id) {
        const item = await this.prisma.payItem.findFirst({
            where: { id, deletedAt: null },
        });
        if (!item)
            throw new common_1.NotFoundException('Pay item not found');
        return item;
    }
    async create(createPayItemDto) {
        const existing = await this.prisma.payItem.findUnique({
            where: { name: createPayItemDto.name }
        });
        if (existing) {
            if (existing.deletedAt) {
                return this.prisma.payItem.update({
                    where: { id: existing.id },
                    data: { ...createPayItemDto, deletedAt: null }
                });
            }
            throw new common_1.BadRequestException('Pay item with this name already exists');
        }
        return this.prisma.payItem.create({
            data: createPayItemDto,
        });
    }
    async update(id, updatePayItemDto) {
        await this.findOne(id);
        return this.prisma.payItem.update({
            where: { id },
            data: updatePayItemDto,
        });
    }
    async remove(id, userId) {
        await this.findOne(id);
        const deleted = await this.prisma.payItem.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'SOFT_DELETE',
                tableName: 'PayItem',
                recordId: id,
                userId: userId,
                reason: 'Deleted by user request via API',
            }
        });
        return { message: 'Pay item deleted successfully' };
    }
};
exports.PayItemService = PayItemService;
exports.PayItemService = PayItemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayItemService);
//# sourceMappingURL=pay-item.service.js.map