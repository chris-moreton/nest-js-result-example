import { Injectable } from '@nestjs/common';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
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
  ): Promise<E.Either<UserServiceError, User>> {
    // Additional business logic validation
    if (dto.email.length > 255) {
      return E.left({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Email is too long (max 255 characters)',
      });
    }

    if (dto.name.trim().length === 0) {
      return E.left({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Name cannot be empty',
      });
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (E.isRight(existingUser)) {
      return E.left({
        type: UserServiceErrorType.EMAIL_ALREADY_EXISTS,
        message: 'A user with this email already exists',
      });
    }

    // Create user
    const createResult = await this.userRepository.create(dto);
    return pipe(
      createResult,
      E.mapLeft(this.mapRepositoryError)
    );
  }

  async findAllUsers(): Promise<E.Either<UserServiceError, User[]>> {
    const result = await this.userRepository.findAll();
    return pipe(
      result,
      E.mapLeft(this.mapRepositoryError)
    );
  }

  async findUserById(id: string): Promise<E.Either<UserServiceError, User>> {
    if (!id || id.trim().length === 0) {
      return E.left({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'User ID is required',
      });
    }

    const result = await this.userRepository.findById(id);
    return pipe(
      result,
      E.mapLeft(this.mapRepositoryError)
    );
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
  ): Promise<E.Either<UserServiceError, User>> {
    if (!id || id.trim().length === 0) {
      return E.left({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'User ID is required',
      });
    }

    // Check if user exists
    const existingUserResult = await this.userRepository.findById(id);
    if (E.isLeft(existingUserResult)) {
      return E.left({
        type: UserServiceErrorType.USER_NOT_FOUND,
        message: `User with id ${id} not found`,
      });
    }

    // Validate update data
    if (dto.email && dto.email.length > 255) {
      return E.left({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Email is too long (max 255 characters)',
      });
    }

    if (dto.name !== undefined && dto.name.trim().length === 0) {
      return E.left({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Name cannot be empty',
      });
    }

    // Check if new email is already taken by another user
    if (dto.email && E.isRight(existingUserResult) && dto.email !== existingUserResult.right.email) {
      const emailCheck = await this.userRepository.findByEmail(dto.email);
      if (E.isRight(emailCheck)) {
        return E.left({
          type: UserServiceErrorType.EMAIL_ALREADY_EXISTS,
          message: 'A user with this email already exists',
        });
      }
    }

    const updateResult = await this.userRepository.update(id, dto);
    return pipe(
      updateResult,
      E.mapLeft(this.mapRepositoryError)
    );
  }

  async deleteUser(id: string): Promise<E.Either<UserServiceError, User>> {
    if (!id || id.trim().length === 0) {
      return E.left({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'User ID is required',
      });
    }

    const deleteResult = await this.userRepository.delete(id);
    return pipe(
      deleteResult,
      E.mapLeft(this.mapRepositoryError)
    );
  }

  // Functional helper methods
  async processUsers<T>(
    processor: (users: User[]) => T,
  ): Promise<E.Either<UserServiceError, T>> {
    const usersResult = await this.findAllUsers();
    return pipe(
      usersResult,
      E.map(processor)
    );
  }

  async findUsersBy(
    predicate: (user: User) => boolean,
  ): Promise<E.Either<UserServiceError, User[]>> {
    const usersResult = await this.findAllUsers();
    return pipe(
      usersResult,
      E.map((users) => users.filter(predicate))
    );
  }

  async countUsers(): Promise<E.Either<UserServiceError, number>> {
    const usersResult = await this.findAllUsers();
    return pipe(
      usersResult,
      E.map((users) => users.length)
    );
  }

  // Transactional method with audit logging
  async createUserWithAudit(
    dto: CreateUserWithAuditDto,
  ): Promise<E.Either<UserServiceError, User>> {
    // Validation
    if (dto.email.length > 255) {
      return E.left({
        type: UserServiceErrorType.VALIDATION_ERROR,
        message: 'Email is too long (max 255 characters)',
      });
    }

    if (dto.name.trim().length === 0) {
      return E.left({
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

        if (E.isLeft(userResult)) {
          throw userResult.left;
        }

        const user = userResult.right;

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

        if (E.isLeft(auditResult)) {
          throw new Error('Failed to create audit log');
        }

        return user;
      });

      return E.right(result);
    } catch (error: any) {
      if (error.code) {
        return E.left(this.mapRepositoryError(error));
      }
      return E.left({
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
  ): Promise<E.Either<UserServiceError, User>> {
    if (!id || id.trim().length === 0) {
      return E.left({
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

        if (E.isLeft(updateResult)) {
          throw updateResult.left;
        }

        const updatedUser = updateResult.right;

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

        if (E.isLeft(auditResult)) {
          throw new Error('Failed to create audit log');
        }

        return updatedUser;
      });

      return E.right(result);
    } catch (error: any) {
      if (error.code) {
        return E.left(this.mapRepositoryError(error));
      }
      return E.left({
        type: UserServiceErrorType.INTERNAL_ERROR,
        message: 'Failed to update user with audit log',
        details: error.message,
      });
    }
  }
}
