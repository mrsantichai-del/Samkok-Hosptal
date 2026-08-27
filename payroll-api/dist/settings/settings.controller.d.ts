import type { Response } from 'express';
export declare class SettingsController {
    uploadLogo(file: Express.Multer.File): {
        message: string;
        path: string;
    };
    uploadSignature(file: Express.Multer.File): {
        message: string;
        path: string;
    };
    getLogo(res: Response): void | Response<any, Record<string, any>>;
    getSignature(res: Response): void | Response<any, Record<string, any>>;
}
