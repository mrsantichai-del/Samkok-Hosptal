import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Roles('System Administrator', 'Finance Officer')
  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get()
  @ApiOperation({ summary: 'Get all active employees' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.employeeService.findAll(skip, take);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Post('types')
  @ApiOperation({ summary: 'Create employee type' })
  createType(@Body() body: { name: string; description?: string }) {
    return this.employeeService.createType(body.name, body.description);
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('types')
  @ApiOperation({ summary: 'Get all employee types' })
  getTypes() {
    return this.employeeService.getTypes();
  }

  @Roles('System Administrator', 'Finance Officer')
  @Patch('types/:id')
  @ApiOperation({ summary: 'Update employee type' })
  updateType(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.employeeService.updateType(id, body);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Delete('types/:id')
  @ApiOperation({ summary: 'Delete employee type' })
  removeType(@Param('id') id: string) {
    return this.employeeService.removeType(id);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Post('positions')
  @ApiOperation({ summary: 'Create position' })
  createPosition(@Body() body: { name: string; description?: string }) {
    return this.employeeService.createPosition(body.name, body.description);
  }

  
  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  getDepartments() {
    return this.employeeService.getDepartments();
  }

  @Roles('System Administrator', 'Finance Officer')
  @Post('departments')
  @ApiOperation({ summary: 'Create department' })
  createDepartment(@Body() body: { name: string; description?: string }) {
    return this.employeeService.createDepartment(body);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Patch('departments/:id')
  @ApiOperation({ summary: 'Update department' })
  updateDepartment(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.employeeService.updateDepartment(id, body);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Delete('departments/:id')
  @ApiOperation({ summary: 'Delete department' })
  deleteDepartment(@Param('id') id: string) {
    return this.employeeService.deleteDepartment(id);
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get('positions')
  @ApiOperation({ summary: 'Get all positions' })
  getPositions() {
    return this.employeeService.getPositions();
  }

  @Roles('System Administrator', 'Finance Officer')
  @Patch('positions/:id')
  @ApiOperation({ summary: 'Update position' })
  updatePosition(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.employeeService.updatePosition(id, body);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Delete('positions/:id')
  @ApiOperation({ summary: 'Delete position' })
  removePosition(@Param('id') id: string) {
    return this.employeeService.removePosition(id);
  }

  @Roles('System Administrator', 'Finance Officer', 'Executive')
  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Roles('System Administrator', 'Finance Officer')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an employee' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.employeeService.remove(id, req.user.userId);
  }
}
