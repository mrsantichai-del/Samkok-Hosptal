import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeeService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(skip?: number, take?: number): Promise<({
        user: {
            id: string;
            username: string;
            passwordHash: string;
            email: string | null;
            isActive: boolean;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            signatureUrl: string | null;
            imgUrl: string | null;
            employeeId: string | null;
        } | null;
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
            departmentId: string | null;
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
        status: string;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        baseSalary: import("@prisma/client-runtime-utils").Decimal | null;
        startDate: Date | null;
        endDate: Date | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            username: string;
            passwordHash: string;
            email: string | null;
            isActive: boolean;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            signatureUrl: string | null;
            imgUrl: string | null;
            employeeId: string | null;
        } | null;
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
            departmentId: string | null;
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
        status: string;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        baseSalary: import("@prisma/client-runtime-utils").Decimal | null;
        startDate: Date | null;
        endDate: Date | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }>;
    create(createEmployeeDto: CreateEmployeeDto): Promise<{
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
            departmentId: string | null;
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
        status: string;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        baseSalary: import("@prisma/client-runtime-utils").Decimal | null;
        startDate: Date | null;
        endDate: Date | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
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
            departmentId: string | null;
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
        status: string;
        employeeCode: string;
        firstName: string;
        lastName: string;
        idCard: string | null;
        bankAccount: string | null;
        bankName: string | null;
        baseSalary: import("@prisma/client-runtime-utils").Decimal | null;
        startDate: Date | null;
        endDate: Date | null;
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
    getDepartments(): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    createDepartment(data: {
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
    updateDepartment(id: string, data: {
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
    createUserAccount(id: string): Promise<{
        success: boolean;
        user: {
            id: string;
            username: string;
            passwordHash: string;
            email: string | null;
            isActive: boolean;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            signatureUrl: string | null;
            imgUrl: string | null;
            employeeId: string | null;
        };
    }>;
    getPositions(): Promise<({
        department: {
            name: string;
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        departmentId: string | null;
        description: string | null;
    })[]>;
    createPosition(name: string, description?: string, departmentId?: string): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        departmentId: string | null;
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
        departmentId: string | null;
        description: string | null;
    }>;
    removePosition(id: string): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        departmentId: string | null;
        description: string | null;
    }>;
}
