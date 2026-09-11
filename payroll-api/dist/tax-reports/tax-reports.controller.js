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
exports.TaxReportsController = void 0;
const common_1 = require("@nestjs/common");
const tax_reports_service_1 = require("./tax-reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TaxReportsController = class TaxReportsController {
    taxReportsService;
    constructor(taxReportsService) {
        this.taxReportsService = taxReportsService;
    }
    async getMyPayslips(req, year, month, round, employeeId) {
        const userId = req.user.userId;
        return this.taxReportsService.getMyPayslips(userId, { year, month, round, employeeId });
    }
    async getMy50Tawi(req, year, employeeId) {
        const userId = req.user.userId;
        const employee = await this.taxReportsService.resolveEmployee(userId, employeeId);
        if (!employee) {
            throw new common_1.NotFoundException('ไม่พบข้อมูลประวัติบุคลากร');
        }
        return this.taxReportsService.get50Tawi(employee.id, year || new Date().getFullYear());
    }
    async get50TawiByEmployee(employeeId, year) {
        return this.taxReportsService.get50Tawi(employeeId, year || new Date().getFullYear());
    }
};
exports.TaxReportsController = TaxReportsController;
__decorate([
    (0, common_1.Get)('my-payslips'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('round')),
    __param(4, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], TaxReportsController.prototype, "getMyPayslips", null);
__decorate([
    (0, common_1.Get)('my-50-tawi'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], TaxReportsController.prototype, "getMy50Tawi", null);
__decorate([
    (0, common_1.Get)('50-tawi/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TaxReportsController.prototype, "get50TawiByEmployee", null);
exports.TaxReportsController = TaxReportsController = __decorate([
    (0, common_1.Controller)('tax-reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tax_reports_service_1.TaxReportsService])
], TaxReportsController);
//# sourceMappingURL=tax-reports.controller.js.map