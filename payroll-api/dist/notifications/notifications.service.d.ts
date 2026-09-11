import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTargetFilter;
    getNotifications(user: {
        userId: string;
        roles?: string[];
    }, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        roleName: string | null;
        title: string;
        message: string;
        isRead: boolean;
        linkUrl: string | null;
    }[]>;
    getUnreadCount(user: {
        userId: string;
        roles?: string[];
    }): Promise<number>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        roleName: string | null;
        title: string;
        message: string;
        isRead: boolean;
        linkUrl: string | null;
    }>;
    markAllAsRead(user: {
        userId: string;
        roles?: string[];
    }): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createNotification(data: {
        userId?: string;
        roleName?: string;
        title: string;
        message: string;
        linkUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        roleName: string | null;
        title: string;
        message: string;
        isRead: boolean;
        linkUrl: string | null;
    }>;
}
