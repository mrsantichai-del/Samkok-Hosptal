import { PayItemService } from './pay-item.service';
import { CreatePayItemDto } from './dto/create-pay-item.dto';
import { UpdatePayItemDto } from './dto/update-pay-item.dto';
export declare class PayItemController {
    private readonly payItemService;
    constructor(payItemService: PayItemService);
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
