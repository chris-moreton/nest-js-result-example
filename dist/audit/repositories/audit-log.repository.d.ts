import { Prisma } from '@prisma/client';
import { Result } from '../../common/utils/result';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction } from '../../common/enums/audit-action.enum';
export interface CreateAuditLogDto {
    userId: string;
    action: AuditAction;
    details: Record<string, any>;
    performedBy: string;
}
export interface AuditLogError {
    code: 'DATABASE_ERROR';
    message: string;
}
export declare class AuditLogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createWithinTransaction(data: CreateAuditLogDto, tx: Prisma.TransactionClient): Promise<Result<AuditLog, AuditLogError>>;
    findByUserId(userId: string): Promise<Result<AuditLog[], AuditLogError>>;
}
