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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../common/utils/result");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const audit_action_enum_1 = require("../../common/enums/audit-action.enum");
const prisma_service_1 = require("../../prisma/prisma.service");
const user_repository_1 = require("../repositories/user.repository");
const audit_log_repository_1 = require("../../audit/repositories/audit-log.repository");
let UserService = class UserService {
    constructor(userRepository, auditLogRepository, prisma) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.prisma = prisma;
    }
    mapRepositoryError(error) {
        switch (error.code) {
            case error_codes_enum_1.UserRepositoryErrorCode.NOT_FOUND:
                return {
                    type: error_codes_enum_1.UserServiceErrorType.USER_NOT_FOUND,
                    message: error.message,
                };
            case error_codes_enum_1.UserRepositoryErrorCode.DUPLICATE_EMAIL:
                return {
                    type: error_codes_enum_1.UserServiceErrorType.EMAIL_ALREADY_EXISTS,
                    message: error.message,
                };
            case error_codes_enum_1.UserRepositoryErrorCode.DATABASE_ERROR:
            default:
                return {
                    type: error_codes_enum_1.UserServiceErrorType.INTERNAL_ERROR,
                    message: 'An unexpected error occurred',
                    details: error.message,
                };
        }
    }
    async createUser(dto) {
        if (dto.email.length > 255) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'Email is too long (max 255 characters)',
            });
        }
        if (dto.name.trim().length === 0) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'Name cannot be empty',
            });
        }
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (result_1.Result.isSuccess(existingUser)) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.EMAIL_ALREADY_EXISTS,
                message: 'A user with this email already exists',
            });
        }
        const createResult = await this.userRepository.create(dto);
        return result_1.Result.mapError(createResult, this.mapRepositoryError);
    }
    async findAllUsers() {
        const result = await this.userRepository.findAll();
        return result_1.Result.mapError(result, this.mapRepositoryError);
    }
    async findUserById(id) {
        if (!id || id.trim().length === 0) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'User ID is required',
            });
        }
        const result = await this.userRepository.findById(id);
        return result_1.Result.mapError(result, this.mapRepositoryError);
    }
    async updateUser(id, dto) {
        if (!id || id.trim().length === 0) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'User ID is required',
            });
        }
        const existingUserResult = await this.userRepository.findById(id);
        if (result_1.Result.isFailure(existingUserResult)) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.USER_NOT_FOUND,
                message: `User with id ${id} not found`,
            });
        }
        if (dto.email && dto.email.length > 255) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'Email is too long (max 255 characters)',
            });
        }
        if (dto.name !== undefined && dto.name.trim().length === 0) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'Name cannot be empty',
            });
        }
        if (dto.email && dto.email !== existingUserResult.value.email) {
            const emailCheck = await this.userRepository.findByEmail(dto.email);
            if (result_1.Result.isSuccess(emailCheck)) {
                return result_1.Result.failure({
                    type: error_codes_enum_1.UserServiceErrorType.EMAIL_ALREADY_EXISTS,
                    message: 'A user with this email already exists',
                });
            }
        }
        const updateResult = await this.userRepository.update(id, dto);
        return result_1.Result.mapError(updateResult, this.mapRepositoryError);
    }
    async deleteUser(id) {
        if (!id || id.trim().length === 0) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'User ID is required',
            });
        }
        const deleteResult = await this.userRepository.delete(id);
        return result_1.Result.mapError(deleteResult, this.mapRepositoryError);
    }
    async processUsers(processor) {
        const usersResult = await this.findAllUsers();
        return result_1.Result.map(usersResult, processor);
    }
    async findUsersBy(predicate) {
        const usersResult = await this.findAllUsers();
        return result_1.Result.map(usersResult, (users) => users.filter(predicate));
    }
    async countUsers() {
        const usersResult = await this.findAllUsers();
        return result_1.Result.map(usersResult, (users) => users.length);
    }
    async createUserWithAudit(dto) {
        if (dto.email.length > 255) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'Email is too long (max 255 characters)',
            });
        }
        if (dto.name.trim().length === 0) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'Name cannot be empty',
            });
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const userResult = await this.userRepository.createWithinTransaction({
                    email: dto.email,
                    name: dto.name,
                }, tx);
                if (result_1.Result.isFailure(userResult)) {
                    throw userResult.error;
                }
                const user = userResult.value;
                const auditResult = await this.auditLogRepository.createWithinTransaction({
                    userId: user.id,
                    action: audit_action_enum_1.AuditAction.CREATE,
                    details: {
                        email: user.email,
                        name: user.name,
                    },
                    performedBy: dto.performedBy,
                }, tx);
                if (result_1.Result.isFailure(auditResult)) {
                    throw new Error('Failed to create audit log');
                }
                return user;
            });
            return result_1.Result.success(result);
        }
        catch (error) {
            if (error.code) {
                return result_1.Result.failure(this.mapRepositoryError(error));
            }
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.INTERNAL_ERROR,
                message: 'Failed to create user with audit log',
                details: error.message,
            });
        }
    }
    async updateUserWithAudit(id, dto) {
        if (!id || id.trim().length === 0) {
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR,
                message: 'User ID is required',
            });
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const currentUser = await tx.user.findUnique({ where: { id } });
                if (!currentUser) {
                    throw {
                        code: error_codes_enum_1.UserRepositoryErrorCode.NOT_FOUND,
                        message: `User with id ${id} not found`,
                    };
                }
                const updateResult = await this.userRepository.updateWithinTransaction(id, dto, tx);
                if (result_1.Result.isFailure(updateResult)) {
                    throw updateResult.error;
                }
                const updatedUser = updateResult.value;
                const changes = {};
                if (dto.email && dto.email !== currentUser.email) {
                    changes.email = { from: currentUser.email, to: dto.email };
                }
                if (dto.name && dto.name !== currentUser.name) {
                    changes.name = { from: currentUser.name, to: dto.name };
                }
                const auditResult = await this.auditLogRepository.createWithinTransaction({
                    userId: id,
                    action: audit_action_enum_1.AuditAction.UPDATE,
                    details: changes,
                    performedBy: dto.performedBy,
                }, tx);
                if (result_1.Result.isFailure(auditResult)) {
                    throw new Error('Failed to create audit log');
                }
                return updatedUser;
            });
            return result_1.Result.success(result);
        }
        catch (error) {
            if (error.code) {
                return result_1.Result.failure(this.mapRepositoryError(error));
            }
            return result_1.Result.failure({
                type: error_codes_enum_1.UserServiceErrorType.INTERNAL_ERROR,
                message: 'Failed to update user with audit log',
                details: error.message,
            });
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        audit_log_repository_1.AuditLogRepository,
        prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map