import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
        employee: {
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
    getRoles(): Promise<{
        description: string;
        userCount: number;
        users: ({
            user: {
                employee: {
                    position: {
                        name: string;
                    } | null;
                    department: {
                        name: string;
                    } | null;
                    id: string;
                    employeeCode: string;
                    firstName: string;
                    lastName: string;
                } | null;
                id: string;
                username: string;
                email: string | null;
                isActive: boolean;
                imgUrl: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getRole(id: string): Promise<{
        description: string;
        userCount: number;
        users: ({
            user: {
                employee: {
                    position: {
                        name: string;
                    } | null;
                    department: {
                        name: string;
                    } | null;
                    id: string;
                    employeeCode: string;
                    firstName: string;
                    lastName: string;
                } | null;
                id: string;
                username: string;
                email: string | null;
                isActive: boolean;
                imgUrl: string | null;
            };
        } & {
            id: string;
            deletedAt: Date | null;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
        name: string;
        id: string;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createRole(body: {
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
    updateRole(id: string, body: {
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
    removeRole(id: string): Promise<{
        message: string;
    }>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        employee: {
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
    deleteImage(id: string): Promise<({
        employee: {
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
    findAll(): Promise<({
        employee: ({
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
        }) | null;
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
}
