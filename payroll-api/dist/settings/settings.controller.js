"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || 'https://wjjewbltlwvsqljeazlz.supabase.co', process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamV3Ymx0bHd2c3FsamVhemx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczOTkxNCwiZXhwIjoyMTAzMzE1OTE0fQ.j2TyaPGhFOIvoO7RhO7i6CKJspjMoia4gMPJ5VVMKH4');
let SettingsController = class SettingsController {
    async uploadLogo(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const ext = (0, path_1.extname)(file.originalname);
        const fileName = `logo${ext}`;
        const { data, error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
            upsert: true,
            contentType: file.mimetype
        });
        if (error)
            throw new common_1.BadRequestException('Failed to upload to Supabase: ' + error.message);
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
        return { message: 'Logo uploaded successfully', path: urlData.publicUrl };
    }
    async uploadSignature(file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const ext = (0, path_1.extname)(file.originalname);
        const fileName = `signature${ext}`;
        const { data, error } = await supabase.storage.from('uploads').upload(fileName, file.buffer, {
            upsert: true,
            contentType: file.mimetype
        });
        if (error)
            throw new common_1.BadRequestException('Failed to upload to Supabase: ' + error.message);
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
        return { message: 'Signature uploaded successfully', path: urlData.publicUrl };
    }
    async getLogo(res) {
        const { data, error } = await supabase.storage.from('uploads').list();
        if (error || !data)
            return res.status(404).send('Not found');
        const logoFile = data.find(f => f.name.startsWith('logo.'));
        if (!logoFile)
            return res.status(404).send('Not found');
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(logoFile.name);
        return res.redirect(urlData.publicUrl);
    }
    async getSignature(res) {
        const { data, error } = await supabase.storage.from('uploads').list();
        if (error || !data)
            return res.status(404).send('Not found');
        const signatureFile = data.find(f => f.name.startsWith('signature.'));
        if (!signatureFile)
            return res.status(404).send('Not found');
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(signatureFile.name);
        return res.redirect(urlData.publicUrl);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer'),
    (0, common_1.Post)('upload-logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer'),
    (0, common_1.Post)('upload-signature'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "uploadSignature", null);
__decorate([
    (0, common_1.Get)('logo'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getLogo", null);
__decorate([
    (0, common_1.Get)('signature'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSignature", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings')
], SettingsController);
//# sourceMappingURL=settings.controller.js.map