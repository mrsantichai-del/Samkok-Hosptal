import { PrismaService } from '../prisma/prisma.service';
import { CreatePayItemDto } from './dto/create-pay-item.dto';
import { UpdatePayItemDto } from './dto/update-pay-item.dto';
export declare class PayItemService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PayItemType;
        isDefault: boolean;
        defaultFormula: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PayItemType;
        isDefault: boolean;
        defaultFormula: string | null;
    }>;
    create(createPayItemDto: CreatePayItemDto): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PayItemType;
        isDefault: boolean;
        defaultFormula: string | null;
    }>;
    update(id: string, updatePayItemDto: UpdatePayItemDto): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PayItemType;
        isDefault: boolean;
        defaultFormula: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
