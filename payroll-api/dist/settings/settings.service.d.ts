export interface HospitalSettings {
    name: string;
    nameEn?: string;
    taxId: string;
    address: string;
    phone?: string;
    directorName?: string;
    directorTitle?: string;
}
export declare class SettingsService {
    private filePath;
    private cachedSettings;
    getHospitalSettings(): HospitalSettings;
    updateHospitalSettings(newSettings: Partial<HospitalSettings>): HospitalSettings;
}
