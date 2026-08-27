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
exports.PayItemController = void 0;
const common_1 = require("@nestjs/common");
const pay_item_service_1 = require("./pay-item.service");
const create_pay_item_dto_1 = require("./dto/create-pay-item.dto");
const update_pay_item_dto_1 = require("./dto/update-pay-item.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let PayItemController = class PayItemController {
    payItemService;
    constructor(payItemService) {
        this.payItemService = payItemService;
    }
    create(createPayItemDto) {
        return this.payItemService.create(createPayItemDto);
    }
    findAll() {
        return this.payItemService.findAll();
    }
    findOne(id) {
        return this.payItemService.findOne(id);
    }
    update(id, updatePayItemDto) {
        return this.payItemService.update(id, updatePayItemDto);
    }
    remove(id, req) {
        return this.payItemService.remove(id, req.user.userId);
    }
};
exports.PayItemController = PayItemController;
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer'),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new pay item (Income or Deduction)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pay_item_dto_1.CreatePayItemDto]),
    __metadata("design:returntype", void 0)
], PayItemController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer', 'Executive'),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active pay items' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayItemController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer', 'Executive'),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a pay item by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayItemController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer'),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a pay item (Formula, Name, etc.)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_pay_item_dto_1.UpdatePayItemDto]),
    __metadata("design:returntype", void 0)
], PayItemController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('System Administrator', 'Finance Officer'),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a pay item' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayItemController.prototype, "remove", null);
exports.PayItemController = PayItemController = __decorate([
    (0, swagger_1.ApiTags)('Pay Items (Income/Deduction)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('pay-items'),
    __metadata("design:paramtypes", [pay_item_service_1.PayItemService])
], PayItemController);
//# sourceMappingURL=pay-item.controller.js.map