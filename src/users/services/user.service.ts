import { Injectable } from '@nestjs/common';
import { Result } from '../../common/utils/result';
import { UserRepositoryErrorCode, UserServiceErrorType } from '../../common/enums/error-codes.enum';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  UserRepository,
  UserRepositoryError,
} from '../repositories/user.repository';

export interface UserServiceError {
  type: UserServiceErrorType;
  message: string;
  details?: any;
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
