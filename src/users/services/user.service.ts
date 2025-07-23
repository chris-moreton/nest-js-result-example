import { Injectable } from '@nestjs/common';
import { Result } from '../../common/utils/result';
import {
  UserRepositoryErrorCode,
  UserServiceErrorType,
} from '../../common/enums/error-codes.enum';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserWithAuditDto } from '../dto/create-user-with-audit.dto';
import {
  UserRepository,
  UserRepositoryError,
} from '../repositories/user.repository';
import { AuditLogRepository } from '../../audit/repositories/audit-log.repository';

export interface UserServiceError {
  type: UserServiceErrorType;
  message: string;
  details?: any;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly prisma: PrismaService,
  ) {}

  private mapRepositoryError(error: UserRepositoryError): UserServiceError {
    switch (error.code) {
      case UserRepositoryErrorCode.NOT_FOUND:
        return {
          type: UserServiceErrorType.USER_NOT_FOUND,
          message: error.message,
        };
      case UserRepositoryErrorCode.DUPLICATE_EMAIL:
        return {
          type: UserServiceErrorType.EMAIL_ALREADY_EXISTS,
          message: error.message,
        };
      case UserRepositoryErrorCode.DATABASE_ERROR:
      default:
        return {
          type: UserServiceErrorType.INTERNAL_ERROR,
          message: 'An unexpected error occurred',
          details: error.message,
        };
    }
  }

  async createUser(
    dto: CreateUserDto,
  ): Promise<Result<User, UserServiceError>> {
    // Additional business logic validation
    if (dto.email.length > 255) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Email is too long (max 255 characters)',
      });
    }

    if (dto.name.trim().length === 0) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Name cannot be empty',
      });
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (Result.isSuccess(existingUser)) {
      return Result.failure({
        type: UserServiceErrorType.EMAIL_ALREADY_EXISTS,
        message: 'A user with this email already exists',
      });
    }

    // Create user
    const createResult = await this.userRepository.create(dto);
    return Result.mapError(createResult, this.mapRepositoryError);
  }

  async findAllUsers(): Promise<Result<User[], UserServiceError>> {
    const result = await this.userRepository.findAll();
    return Result.mapError(result, this.mapRepositoryError);
  }

  async findUserById(id: string): Promise<Result<User, UserServiceError>> {
    if (!id || id.trim().length === 0) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'User ID is required',
      });
    }

    const result = await this.userRepository.findById(id);
    return Result.mapError(result, this.mapRepositoryError);
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
  ): Promise<Result<User, UserServiceError>> {
    if (!id || id.trim().length === 0) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'User ID is required',
      });
    }

    // Check if user exists
    const existingUserResult = await this.userRepository.findById(id);
    if (Result.isFailure(existingUserResult)) {
      return Result.failure({
        type: UserServiceErrorType.USER_NOT_FOUND,
        message: `User with id ${id} not found`,
      });
    }

    // Validate update data
    if (dto.email && dto.email.length > 255) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Email is too long (max 255 characters)',
      });
    }

    if (dto.name !== undefined && dto.name.trim().length === 0) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Name cannot be empty',
      });
    }

    // Check if new email is already taken by another user
    if (dto.email && dto.email !== existingUserResult.value.email) {
      const emailCheck = await this.userRepository.findByEmail(dto.email);
      if (Result.isSuccess(emailCheck)) {
        return Result.failure({
          type: UserServiceErrorType.EMAIL_ALREADY_EXISTS,
          message: 'A user with this email already exists',
        });
      }
    }

    const updateResult = await this.userRepository.update(id, dto);
    return Result.mapError(updateResult, this.mapRepositoryError);
  }

  async deleteUser(id: string): Promise<Result<User, UserServiceError>> {
    if (!id || id.trim().length === 0) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'User ID is required',
      });
    }

    const deleteResult = await this.userRepository.delete(id);
    return Result.mapError(deleteResult, this.mapRepositoryError);
  }

  // Functional helper methods
  async processUsers<T>(
    processor: (users: User[]) => T,
  ): Promise<Result<T, UserServiceError>> {
    const usersResult = await this.findAllUsers();
    return Result.map(usersResult, processor);
  }

  async findUsersBy(
    predicate: (user: User) => boolean,
  ): Promise<Result<User[], UserServiceError>> {
    const usersResult = await this.findAllUsers();
    return Result.map(usersResult, (users) => users.filter(predicate));
  }

  async countUsers(): Promise<Result<number, UserServiceError>> {
    const usersResult = await this.findAllUsers();
    return Result.map(usersResult, (users) => users.length);
  }

  // Transactional method with audit logging
  async createUserWithAudit(
    dto: CreateUserWithAuditDto,
  ): Promise<Result<User, UserServiceError>> {
    // Validation
    if (dto.email.length > 255) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Email is too long (max 255 characters)',
      });
    }

    if (dto.name.trim().length === 0) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Name cannot be empty',
      });
    }

    // Use Prisma transaction
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user within transaction
        const userResult = await this.userRepository.createWithinTransaction(
          {
            email: dto.email,
            name: dto.name,
          },
          tx,
        );

        if (Result.isFailure(userResult)) {
          throw userResult.error;
        }

        const user = userResult.value;

        // Create audit log within same transaction
        const auditResult =
          await this.auditLogRepository.createWithinTransaction(
            {
              userId: user.id,
              action: AuditAction.CREATE,
              details: {
                email: user.email,
                name: user.name,
              },
              performedBy: dto.performedBy,
            },
            tx,
          );

        if (Result.isFailure(auditResult)) {
          throw new Error('Failed to create audit log');
        }

        return user;
      });

      return Result.success(result);
    } catch (error: any) {
      if (error.code) {
        return Result.failure(this.mapRepositoryError(error));
      }
      return Result.failure({
        type: UserServiceErrorType.INTERNAL_ERROR,
        message: 'Failed to create user with audit log',
        details: error.message,
      });
    }
  }

  // Another transactional example: bulk update with audit
  async updateUserWithAudit(
    id: string,
    dto: UpdateUserDto & { performedBy: string },
  ): Promise<Result<User, UserServiceError>> {
    if (!id || id.trim().length === 0) {
      return Result.failure({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'User ID is required',
      });
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Get current user state for audit
        const currentUser = await tx.user.findUnique({ where: { id } });
        if (!currentUser) {
          throw {
            code: UserRepositoryErrorCode.NOT_FOUND,
            message: `User with id ${id} not found`,
          };
        }

        // Update user
        const updateResult = await this.userRepository.updateWithinTransaction(
          id,
          dto,
          tx,
        );

        if (Result.isFailure(updateResult)) {
          throw updateResult.error;
        }

        const updatedUser = updateResult.value;

        // Create audit log
        const changes: Record<string, any> = {};
        if (dto.email && dto.email !== currentUser.email) {
          changes.email = { from: currentUser.email, to: dto.email };
        }
        if (dto.name && dto.name !== currentUser.name) {
          changes.name = { from: currentUser.name, to: dto.name };
        }

        const auditResult =
          await this.auditLogRepository.createWithinTransaction(
            {
              userId: id,
              action: AuditAction.UPDATE,
              details: changes,
              performedBy: dto.performedBy,
            },
            tx,
          );

        if (Result.isFailure(auditResult)) {
          throw new Error('Failed to create audit log');
        }

        return updatedUser;
      });

      return Result.success(result);
    } catch (error: any) {
      if (error.code) {
        return Result.failure(this.mapRepositoryError(error));
      }
      return Result.failure({
        type: UserServiceErrorType.INTERNAL_ERROR,
        message: 'Failed to update user with audit log',
        details: error.message,
      });
    }
  }
}
