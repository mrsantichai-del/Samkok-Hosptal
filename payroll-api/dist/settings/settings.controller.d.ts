import type { Response } from 'express';
export declare class SettingsController {
    uploadLogo(file: Express.Multer.File): Promise<{
        message: string;
        path: string;
    }>;
    uploadSignature(file: Express.Multer.File): Promise<{
        message: string;
        path: string;
    }>;
    getLogo(res: Response): Promise<void | Response<any, Record<string, any>>>;
    getSignature(res: Response): Promise<void | Response<any, Record<string, any>>>;
}
