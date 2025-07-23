import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as E from 'fp-ts/Either';
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

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithinTransaction(
    data: CreateAuditLogDto,
    tx: Prisma.TransactionClient,
  ): Promise<E.Either<AuditLogError, AuditLog>> {
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
    } catch (error: any) {
      return E.left({
        code: 'DATABASE_ERROR',
        message: error.message || 'Failed to create audit log',
      });
    }
  }

  async findByUserId(
    userId: string,
  ): Promise<E.Either<AuditLogError, AuditLog[]>> {
    try {
      const logs = await this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return E.right(
        logs.map((log) => ({
          id: log.id,
          userId: log.userId,
          action: log.action,
          details: log.details,
          performedBy: log.performedBy,
          createdAt: log.createdAt,
        })),
      );
    } catch (error: any) {
      return E.left({
        code: 'DATABASE_ERROR',
        message: error.message || 'Failed to fetch audit logs',
      });
    }
  }
}
