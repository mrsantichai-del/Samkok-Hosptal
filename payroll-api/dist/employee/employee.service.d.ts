import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeeService {
    private prisma;
    constructor(prisma: PrismaService);
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
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    getTypes(): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    createType(name: string, description?: string): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    updateType(id: string, data: {
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
    getPositions(): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    createPosition(name: string, description?: string): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    updatePosition(id: string, data: {
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
}
