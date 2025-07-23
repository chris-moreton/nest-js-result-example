"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let FunctionalExceptionFilter = class FunctionalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const errorResponse = this.createErrorResponse(exception, request);
        response.status(errorResponse.statusCode).json(errorResponse);
    }
    createErrorResponse(exception, request) {
        const baseResponse = {
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            return {
                ...baseResponse,
                statusCode: status,
                ...(typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse }),
            };
        }
        if (exception instanceof Error) {
            return {
                ...baseResponse,
                error: 'Internal Server Error',
                message: exception.message,
                ...(process.env.NODE_ENV === 'development' && { details: exception.stack }),
            };
        }
        return {
            ...baseResponse,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
        };
    }
};
exports.FunctionalExceptionFilter = FunctionalExceptionFilter;
exports.FunctionalExceptionFilter = FunctionalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], FunctionalExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map