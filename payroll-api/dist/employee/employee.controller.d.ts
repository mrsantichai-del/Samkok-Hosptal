import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }>;
    findAll(skip?: number, take?: number): Promise<({
        employeeType: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
        position: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
        department: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    })[]>;
    createType(body: {
        name: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    getTypes(): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    updateType(id: string, body: {
        name?: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    removeType(id: string): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    createPosition(body: {
        name: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    getDepartments(): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    createDepartment(body: {
        name: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    updateDepartment(id: string, body: {
        name?: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    deleteDepartment(id: string): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    getPositions(): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    updatePosition(id: string, body: {
        name?: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    removePosition(id: string): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    findOne(id: string): Promise<{
        employeeType: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
        position: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
        department: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
    } & {
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
