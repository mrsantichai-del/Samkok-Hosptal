import { PayItemType } from '@prisma/client';
export declare class CreatePayItemDto {
    name: string;
    type: PayItemType;
    description?: string;
    isDefault?: boolean;
    defaultFormula?: string;
    isAccumulative?: boolean;
    accumulateResetType?: string;
    accumulateStartMonth?: number;
    accumulateLabel?: string;
}
