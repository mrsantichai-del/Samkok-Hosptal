import { PartialType } from '@nestjs/swagger';
import { CreatePayItemDto } from './create-pay-item.dto';

export class UpdatePayItemDto extends PartialType(CreatePayItemDto) {}
