"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServiceErrorType = exports.UserRepositoryErrorCode = void 0;
var UserRepositoryErrorCode;
(function (UserRepositoryErrorCode) {
    UserRepositoryErrorCode["NOT_FOUND"] = "NOT_FOUND";
    UserRepositoryErrorCode["DUPLICATE_EMAIL"] = "DUPLICATE_EMAIL";
    UserRepositoryErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
})(UserRepositoryErrorCode || (exports.UserRepositoryErrorCode = UserRepositoryErrorCode = {}));
var UserServiceErrorType;
(function (UserServiceErrorType) {
    UserServiceErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    UserServiceErrorType["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    UserServiceErrorType["EMAIL_ALREADY_EXISTS"] = "EMAIL_ALREADY_EXISTS";
    UserServiceErrorType["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(UserServiceErrorType || (exports.UserServiceErrorType = UserServiceErrorType = {}));
//# sourceMappingURL=error-codes.enum.js.map