import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, limit?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        roleName: string | null;
        title: string;
        message: string;
        isRead: boolean;
        linkUrl: string | null;
    }[]>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markAllAsRead(req: any): Promise<{
        message: string;
    }>;
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
}
