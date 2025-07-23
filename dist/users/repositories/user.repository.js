"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../common/utils/result");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const prisma_service_1 = require("../../prisma/prisma.service");
let UserRepository = class UserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapPrismaUserToEntity(prismaUser) {
        return {
            id: prismaUser.id,
            email: prismaUser.email,
            name: prismaUser.name,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        };
    }
    async create(data) {
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                },
            });
            return result_1.Result.success(this.mapPrismaUserToEntity(user));
        }
        catch (error) {
            if (error.code === 'P2002') {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.DUPLICATE_EMAIL,
                    message: 'A user with this email already exists',
                });
            }
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
    async createWithinTransaction(data, tx) {
        try {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                },
            });
            return result_1.Result.success(this.mapPrismaUserToEntity(user));
        }
        catch (error) {
            if (error.code === 'P2002') {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.DUPLICATE_EMAIL,
                    message: 'A user with this email already exists',
                });
            }
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
    async findAll() {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return result_1.Result.success(users.map(this.mapPrismaUserToEntity));
        }
        catch (error) {
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
    async findById(id) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.NOT_FOUND,
                    message: `User with id ${id} not found`,
                });
            }
            return result_1.Result.success(this.mapPrismaUserToEntity(user));
        }
        catch (error) {
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
    async findByEmail(email) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.NOT_FOUND,
                    message: `User with email ${email} not found`,
                });
            }
            return result_1.Result.success(this.mapPrismaUserToEntity(user));
        }
        catch (error) {
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
    async update(id, data) {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data: {
                    ...(data.email && { email: data.email }),
                    ...(data.name && { name: data.name }),
                },
            });
            return result_1.Result.success(this.mapPrismaUserToEntity(user));
        }
        catch (error) {
            if (error.code === 'P2025') {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.NOT_FOUND,
                    message: `User with id ${id} not found`,
                });
            }
            if (error.code === 'P2002') {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.DUPLICATE_EMAIL,
                    message: 'A user with this email already exists',
                });
            }
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
    async updateWithinTransaction(id, data, tx) {
        try {
            const user = await tx.user.update({
                where: { id },
                data: {
                    ...(data.email && { email: data.email }),
                    ...(data.name && { name: data.name }),
                },
            });
            return result_1.Result.success(this.mapPrismaUserToEntity(user));
        }
        catch (error) {
            if (error.code === 'P2025') {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.NOT_FOUND,
                    message: `User with id ${id} not found`,
                });
            }
            if (error.code === 'P2002') {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.DUPLICATE_EMAIL,
                    message: 'A user with this email already exists',
                });
            }
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
    async delete(id) {
        try {
            const user = await this.prisma.user.delete({
                where: { id },
            });
            return result_1.Result.success(this.mapPrismaUserToEntity(user));
        }
        catch (error) {
            if (error.code === 'P2025') {
                return result_1.Result.failure({
                    code: error_codes_enum_1.UserRepositoryErrorCode.NOT_FOUND,
                    message: `User with id ${id} not found`,
                });
            }
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
    async exists(id) {
        try {
            const count = await this.prisma.user.count({
                where: { id },
            });
            return result_1.Result.success(count > 0);
        }
        catch (error) {
            return result_1.Result.failure({
                code: error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR,
                message: error.message || 'Database operation failed',
            });
        }
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserRepository);
//# sourceMappingURL=user.repository.js.map