import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
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
}
