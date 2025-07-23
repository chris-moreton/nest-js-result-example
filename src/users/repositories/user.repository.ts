import { Injectable } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { Result } from '../../common/utils/result';
import { UserRepositoryErrorCode } from '../../common/enums/error-codes.enum';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface UserRepositoryError {
  code: UserRepositoryErrorCode;
  message: string;
}

@Injectable()
export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private mapPrismaUserToEntity(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  async create(data: CreateUserDto): Promise<Result<User, UserRepositoryError>> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
        },
      });
      return Result.success(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      if (error.code === 'P2002') {
        return Result.failure({
          code: UserRepositoryErrorCode.DUPLICATE_EMAIL,
          message: 'A user with this email already exists',
        });
      }
      return Result.failure({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async findAll(): Promise<Result<User[], UserRepositoryError>> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return Result.success(users.map(this.mapPrismaUserToEntity));
    } catch (error: any) {
      return Result.failure({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async findById(id: string): Promise<Result<User, UserRepositoryError>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        return Result.failure({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with id ${id} not found`,
        });
      }
      
      return Result.success(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      return Result.failure({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async findByEmail(email: string): Promise<Result<User, UserRepositoryError>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        return Result.failure({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with email ${email} not found`,
        });
      }
      
      return Result.success(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      return Result.failure({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<Result<User, UserRepositoryError>> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.email && { email: data.email }),
          ...(data.name && { name: data.name }),
        },
      });
      return Result.success(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      if (error.code === 'P2025') {
        return Result.failure({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with id ${id} not found`,
        });
      }
      if (error.code === 'P2002') {
        return Result.failure({
          code: UserRepositoryErrorCode.DUPLICATE_EMAIL,
          message: 'A user with this email already exists',
        });
      }
      return Result.failure({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async delete(id: string): Promise<Result<User, UserRepositoryError>> {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      return Result.success(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      if (error.code === 'P2025') {
        return Result.failure({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with id ${id} not found`,
        });
      }
      return Result.failure({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async exists(id: string): Promise<Result<boolean, UserRepositoryError>> {
    try {
      const count = await this.prisma.user.count({
        where: { id },
      });
      return Result.success(count > 0);
    } catch (error: any) {
      return Result.failure({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }
}