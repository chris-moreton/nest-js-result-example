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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../services/user.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const create_user_dto_1 = require("../dto/create-user.dto");
const update_user_dto_1 = require("../dto/update-user.dto");
const create_user_with_audit_dto_1 = require("../dto/create-user-with-audit.dto");
const result_1 = require("../../common/utils/result");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    handleServiceError(error) {
        const statusMap = {
            [error_codes_enum_1.UserServiceErrorType.VALIDATION_ERROR]: common_1.HttpStatus.BAD_REQUEST,
            [error_codes_enum_1.UserServiceErrorType.USER_NOT_FOUND]: common_1.HttpStatus.NOT_FOUND,
            [error_codes_enum_1.UserServiceErrorType.EMAIL_ALREADY_EXISTS]: common_1.HttpStatus.CONFLICT,
            [error_codes_enum_1.UserServiceErrorType.INTERNAL_ERROR]: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        };
        throw new common_1.HttpException({
            statusCode: statusMap[error.type],
            error: error.type,
            message: error.message,
            ...(error.details && { details: error.details }),
        }, statusMap[error.type]);
    }
    async handleResult(result) {
        const res = await result;
        if (result_1.Result.isFailure(res)) {
            this.handleServiceError(res.error);
        }
        return res.value;
    }
    async create(createUserDto) {
        return this.handleResult(this.userService.createUser(createUserDto));
    }
    async findAll() {
        return this.handleResult(this.userService.findAllUsers());
    }
    async findOne(id) {
        return this.handleResult(this.userService.findUserById(id));
    }
    async update(id, updateUserDto) {
        return this.handleResult(this.userService.updateUser(id, updateUserDto));
    }
    async remove(id) {
        return this.handleResult(this.userService.deleteUser(id));
    }
    async count() {
        const count = await this.handleResult(this.userService.countUsers());
        return { count };
    }
    async filterUsers(filter) {
        return this.handleResult(this.userService.findUsersBy((user) => {
            if (filter.name &&
                !user.name.toLowerCase().includes(filter.name.toLowerCase())) {
                return false;
            }
            return !(filter.email &&
                !user.email.toLowerCase().includes(filter.email.toLowerCase()));
        }));
    }
    async createWithAudit(createUserDto) {
        return this.handleResult(this.userService.createUserWithAudit(createUserDto));
    }
    async updateWithAudit(id, updateDto) {
        return this.handleResult(this.userService.updateUserWithAudit(id, updateDto));
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('search/count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "count", null);
__decorate([
    (0, common_1.Post)('search/filter'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "filterUsers", null);
__decorate([
    (0, common_1.Post)('with-audit'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_with_audit_dto_1.CreateUserWithAuditDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createWithAudit", null);
__decorate([
    (0, common_1.Patch)(':id/with-audit'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateWithAudit", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map