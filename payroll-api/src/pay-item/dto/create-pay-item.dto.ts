import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PayItemType } from '@prisma/client';

export class CreatePayItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PayItemType })
  @IsEnum(PayItemType)
  @IsNotEmpty()
  type: PayItemType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  defaultFormula?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isAccumulative?: boolean;

  @ApiProperty({ required: false, default: 'CALENDAR_YEAR' })
  @IsString()
  @IsOptional()
  accumulateResetType?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  accumulateStartMonth?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  accumulateLabel?: string;
}
