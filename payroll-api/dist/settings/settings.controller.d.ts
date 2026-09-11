import type { Response } from 'express';
import { SettingsService, HospitalSettings } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getHospitalSettings(): HospitalSettings;
    updateHospitalSettings(data: Partial<HospitalSettings>): HospitalSettings;
    updateHospitalSettingsPost(data: Partial<HospitalSettings>): HospitalSettings;
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
