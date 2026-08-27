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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const payroll_service_1 = require("./payroll.service");
const process_payroll_dto_1 = require("./dto/process-payroll.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let PayrollController = class PayrollController {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    processPayroll(processPayrollDto, req) {
        return this.payrollService.processPayroll(processPayrollDto, req.user.userId);
    }
    getRecords() {
        return this.payrollService.getPayrollRecords();
    }
    getTransactions(id, employeeId) {
        return this.payrollService.getPayrollTransactions(id, employeeId);
    }
    updateEmployeeTransactions(id, empId, body, req) {
        return this.payrollService.updateEmployeeTransactions(id, empId, body.transactions, req.user.userId);
    }
    approvePayroll(id, req) {
        return this.payrollService.approvePayroll(id, req.user.userId);
    }
    exportExcel(id, res) {
        return this.payrollService.exportExcel(id, res);
    }
    exportPdf(id, res) {
        return this.payrollService.exportPdf(id, res);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer'),
    (0, common_1.Post)('process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process payroll for a given month and year (Draft)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [process_payroll_dto_1.ProcessPayrollDto, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "processPayroll", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer', 'Executive'),
    (0, common_1.Get)('records'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payroll records (summary)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getRecords", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer', 'Executive'),
    (0, common_1.Get)('records/:id/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions for a payroll record' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getTransactions", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer'),
    (0, common_1.Patch)('records/:id/employee/:empId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transactions for a specific employee in a payroll record' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('empId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "updateEmployeeTransactions", null);
__decorate([
    (0, roles_decorator_1.Roles)('Executive', 'System Administrator'),
    (0, common_1.Patch)('records/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a payroll record (Executive only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "approvePayroll", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer', 'Executive'),
    (0, common_1.Get)('records/:id/export/excel'),
    (0, swagger_1.ApiOperation)({ summary: 'Export Payroll to Excel' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "exportExcel", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer', 'Executive', 'Employee'),
    (0, common_1.Get)('records/:id/export/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Export Payslips to PDF' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "exportPdf", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll Processing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map