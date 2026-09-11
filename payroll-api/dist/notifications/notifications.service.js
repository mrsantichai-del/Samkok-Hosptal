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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTargetFilter(user) {
        const roles = Array.isArray(user.roles) ? user.roles : user.roles ? [user.roles] : [];
        const orConditions = [
            { userId: user.userId },
            { userId: null, roleName: null },
            { roleName: 'ALL' },
        ];
        if (roles.length > 0) {
            orConditions.push({ roleName: { in: roles } });
        }
        if (roles.includes('Admin')) {
            return {};
        }
        return { OR: orConditions };
    }
    async getNotifications(user, limit = 30) {
        const filter = this.getTargetFilter(user);
        return this.prisma.notification.findMany({
            where: filter,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getUnreadCount(user) {
        const filter = this.getTargetFilter(user);
        return this.prisma.notification.count({
            where: {
                ...filter,
                isRead: false,
            },
        });
    }
    async markAsRead(id) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markAllAsRead(user) {
        const filter = this.getTargetFilter(user);
        return this.prisma.notification.updateMany({
            where: {
                ...filter,
                isRead: false,
            },
            data: { isRead: true },
        });
    }
    async createNotification(data) {
        return this.prisma.notification.create({
            data,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map