"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_SETTINGS = {
    name: 'โรงพยาบาลสามโคก',
    nameEn: 'Samkok Hospital',
    taxId: '0994000164821',
    address: 'เลขที่ 99 หมู่ 3 ถนนปทุมธานี-เสนา ตำบลสามโคก อำเภอสามโคก จังหวัดปทุมธานี 12160',
    phone: '02-593-1234',
    directorName: 'ผู้อำนวยการโรงพยาบาลสามโคก',
    directorTitle: 'ผู้อำนวยการโรงพยาบาลสามโคก'
};
let SettingsService = class SettingsService {
    filePath = path.resolve(process.cwd(), 'hospital-settings.json');
    cachedSettings = null;
    getHospitalSettings() {
        if (this.cachedSettings) {
            return this.cachedSettings;
        }
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf-8');
                const parsed = JSON.parse(raw);
                this.cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
                return this.cachedSettings;
            }
        }
        catch (e) {
            console.error('Error reading hospital settings file, falling back to default:', e);
        }
        this.cachedSettings = { ...DEFAULT_SETTINGS };
        return this.cachedSettings;
    }
    updateHospitalSettings(newSettings) {
        const current = this.getHospitalSettings();
        const updated = {
            ...current,
            ...newSettings,
            taxId: (newSettings.taxId || current.taxId || '').replace(/\D/g, '')
        };
        this.cachedSettings = updated;
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(updated, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Error writing hospital settings file:', e);
        }
        return updated;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)()
], SettingsService);
//# sourceMappingURL=settings.service.js.map