import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        employee: {
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
        } | null;
        roles: ({
            role: {
                name: string;
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
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
    }>;
    uploadSignature(id: string, file: Express.Multer.File): Promise<{
        employee: {
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
        } | null;
        roles: ({
            role: {
                name: string;
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
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
    }>;
    constructor(usersService: UsersService);
    getRoles(): Promise<{
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    findAll(): Promise<({
        employee: {
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
        } | null;
        roles: ({
            role: {
                name: string;
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        employee: {
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
        } | null;
        roles: ({
            role: {
                name: string;
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
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
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        employee: {
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
        } | null;
        roles: ({
            role: {
                name: string;
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
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
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        employee: {
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
        } | null;
        roles: ({
            role: {
                name: string;
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
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
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    deleteImage(id: string): Promise<({
        employee: {
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
        } | null;
        roles: ({
            role: {
                name: string;
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
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
    }) | {
        message: string;
    }>;
    deleteSignature(id: string): Promise<({
        employee: {
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
        } | null;
        roles: ({
            role: {
                name: string;
                id: string;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
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
    }) | {
        message: string;
    }>;
}
