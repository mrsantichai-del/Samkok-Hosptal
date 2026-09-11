import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface HospitalSettings {
  name: string;
  nameEn?: string;
  taxId: string;
  address: string;
  phone?: string;
  directorName?: string;
  directorTitle?: string;
}

const DEFAULT_SETTINGS: HospitalSettings = {
  name: 'โรงพยาบาลสามโคก',
  nameEn: 'Samkok Hospital',
  taxId: '0994000164821',
  address: 'เลขที่ 99 หมู่ 3 ถนนปทุมธานี-เสนา ตำบลสามโคก อำเภอสามโคก จังหวัดปทุมธานี 12160',
  phone: '02-593-1234',
  directorName: 'ผู้อำนวยการโรงพยาบาลสามโคก',
  directorTitle: 'ผู้อำนวยการโรงพยาบาลสามโคก'
};

@Injectable()
export class SettingsService {
  private filePath = path.resolve(process.cwd(), 'hospital-settings.json');
  private cachedSettings: HospitalSettings | null = null;

  getHospitalSettings(): HospitalSettings {
    if (this.cachedSettings) {
      return this.cachedSettings;
    }

    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
        return this.cachedSettings!;
      }
    } catch (e) {
      console.error('Error reading hospital settings file, falling back to default:', e);
    }

    this.cachedSettings = { ...DEFAULT_SETTINGS };
    return this.cachedSettings;
  }

  updateHospitalSettings(newSettings: Partial<HospitalSettings>): HospitalSettings {
    const current = this.getHospitalSettings();
    const updated: HospitalSettings = {
      ...current,
      ...newSettings,
      taxId: (newSettings.taxId || current.taxId || '').replace(/\D/g, '')
    };

    this.cachedSettings = updated;

    try {
      fs.writeFileSync(this.filePath, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing hospital settings file:', e);
    }

    return updated;
  }
}
