import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeeService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(skip?: number, take?: number): Promise<({
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
        } | null;
        position: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
        } | null;
        employeeType: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeCode: string;
        idCard: string | null;
        firstName: string;
        lastName: string;
        bankAccount: string | null;
        bankName: string | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
        } | null;
        position: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
        } | null;
        employeeType: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeCode: string;
        idCard: string | null;
        firstName: string;
        lastName: string;
        bankAccount: string | null;
        bankName: string | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }>;
    create(createEmployeeDto: CreateEmployeeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeCode: string;
        idCard: string | null;
        firstName: string;
        lastName: string;
        bankAccount: string | null;
        bankName: string | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeCode: string;
        idCard: string | null;
        firstName: string;
        lastName: string;
        bankAccount: string | null;
        bankName: string | null;
        departmentId: string | null;
        positionId: string | null;
        employeeTypeId: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
