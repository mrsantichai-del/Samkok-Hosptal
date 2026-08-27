"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePayItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_pay_item_dto_1 = require("./create-pay-item.dto");
class UpdatePayItemDto extends (0, swagger_1.PartialType)(create_pay_item_dto_1.CreatePayItemDto) {
}
exports.UpdatePayItemDto = UpdatePayItemDto;
//# sourceMappingURL=update-pay-item.dto.js.map