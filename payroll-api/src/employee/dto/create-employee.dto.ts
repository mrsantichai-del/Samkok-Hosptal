import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  idCard?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bankAccount?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  positionId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  employeeTypeId?: string;
}
