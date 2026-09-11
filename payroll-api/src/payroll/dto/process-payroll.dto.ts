import { IsNumber, IsNotEmpty, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPayrollDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(2000)
  year: number;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  round?: number;

  @ApiProperty({ required: false, default: 'รอบปกติ' })
  @IsOptional()
  @IsString()
  roundName?: string;
}
