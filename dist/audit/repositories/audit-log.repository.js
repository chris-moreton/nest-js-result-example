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
exports.AuditLogRepository = void 0;
const common_1 = require("@nestjs/common");
const E = require("fp-ts/Either");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditLogRepository = class AuditLogRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWithinTransaction(data, tx) {
        try {
            const auditLog = await tx.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    details: JSON.stringify(data.details),
                    performedBy: data.performedBy,
                },
            });
            return E.right({
                id: auditLog.id,
                userId: auditLog.userId,
                action: auditLog.action,
                details: auditLog.details,
                performedBy: auditLog.performedBy,
                createdAt: auditLog.createdAt,
            });
        }
        catch (error) {
            return E.left({
                code: 'DATABASE_ERROR',
                message: error.message || 'Failed to create audit log',
            });
        }
    }
    async findByUserId(userId) {
        try {
            const logs = await this.prisma.auditLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            return E.right(logs.map((log) => ({
                id: log.id,
                userId: log.userId,
                action: log.action,
                details: log.details,
                performedBy: log.performedBy,
                createdAt: log.createdAt,
            })));
        }
        catch (error) {
            return E.left({
                code: 'DATABASE_ERROR',
                message: error.message || 'Failed to fetch audit logs',
            });
        }
    }
};
exports.AuditLogRepository = AuditLogRepository;
exports.AuditLogRepository = AuditLogRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogRepository);
//# sourceMappingURL=audit-log.repository.js.map