import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PayItemService } from './pay-item.service';
import { CreatePayItemDto } from './dto/create-pay-item.dto';
import { UpdatePayItemDto } from './dto/update-pay-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Pay Items (Income/Deduction)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pay-items')
export class PayItemController {
  constructor(private readonly payItemService: PayItemService) {}

  @Roles('System Administrator', 'Finance Officer')
  @Post()
  @ApiOperation({ summary: 'Create a new pay item (Income or Deduction)' })
  create(@Body() createPayItemDto: CreatePayItemDto) {
    return this.payItemService.create(createPayItemDto);
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get()
  @ApiOperation({ summary: 'Get all active pay items' })
  findAll() {
    return this.payItemService.findAll();
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get(':id')
  @ApiOperation({ summary: 'Get a pay item by ID' })
  findOne(@Param('id') id: string) {
    return this.payItemService.findOne(id);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a pay item (Formula, Name, etc.)' })
  update(@Param('id') id: string, @Body() updatePayItemDto: UpdatePayItemDto) {
    return this.payItemService.update(id, updatePayItemDto);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a pay item' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.payItemService.remove(id, req.user.userId);
  }
}
