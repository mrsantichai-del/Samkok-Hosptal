import { PayItemService } from './pay-item.service';
import { CreatePayItemDto } from './dto/create-pay-item.dto';
import { UpdatePayItemDto } from './dto/update-pay-item.dto';
export declare class PayItemController {
    private readonly payItemService;
    constructor(payItemService: PayItemService);
    create(createPayItemDto: CreatePayItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        type: import("@prisma/client").$Enums.PayItemType;
        description: string | null;
        isDefault: boolean;
        defaultFormula: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        type: import("@prisma/client").$Enums.PayItemType;
        description: string | null;
        isDefault: boolean;
        defaultFormula: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        type: import("@prisma/client").$Enums.PayItemType;
        description: string | null;
        isDefault: boolean;
        defaultFormula: string | null;
    }>;
    update(id: string, updatePayItemDto: UpdatePayItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        type: import("@prisma/client").$Enums.PayItemType;
        description: string | null;
        isDefault: boolean;
        defaultFormula: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
