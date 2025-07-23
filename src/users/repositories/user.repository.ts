import { Injectable } from '@nestjs/common';
import { User as PrismaUser, Prisma } from '@prisma/client';
import * as E from 'fp-ts/Either';
import { UserRepositoryErrorCode } from '../../common/enums/error-codes.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface UserRepositoryError {
  code: UserRepositoryErrorCode;
  message: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaUserToEntity(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  async create(
    data: CreateUserDto,
  ): Promise<E.Either<UserRepositoryError, User>> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
        },
      });
      return E.right(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      if (error.code === 'P2002') {
        return E.left({
          code: UserRepositoryErrorCode.DUPLICATE_EMAIL,
          message: 'A user with this email already exists',
        });
      }
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async createWithinTransaction(
    data: CreateUserDto,
    tx: Prisma.TransactionClient,
  ): Promise<E.Either<UserRepositoryError, User>> {
    try {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
        },
      });
      return E.right(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      if (error.code === 'P2002') {
        return E.left({
          code: UserRepositoryErrorCode.DUPLICATE_EMAIL,
          message: 'A user with this email already exists',
        });
      }
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async findAll(): Promise<E.Either<UserRepositoryError, User[]>> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return E.right(users.map(this.mapPrismaUserToEntity));
    } catch (error: any) {
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async findById(id: string): Promise<E.Either<UserRepositoryError, User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return E.left({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with id ${id} not found`,
        });
      }

      return E.right(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async findByEmail(email: string): Promise<E.Either<UserRepositoryError, User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return E.left({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with email ${email} not found`,
        });
      }

      return E.right(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<E.Either<UserRepositoryError, User>> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.email && { email: data.email }),
          ...(data.name && { name: data.name }),
        },
      });
      return E.right(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      if (error.code === 'P2025') {
        return E.left({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with id ${id} not found`,
        });
      }
      if (error.code === 'P2002') {
        return E.left({
          code: UserRepositoryErrorCode.DUPLICATE_EMAIL,
          message: 'A user with this email already exists',
        });
      }
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async updateWithinTransaction(
    id: string,
    data: UpdateUserDto,
    tx: Prisma.TransactionClient,
  ): Promise<E.Either<UserRepositoryError, User>> {
    try {
      const user = await tx.user.update({
        where: { id },
        data: {
          ...(data.email && { email: data.email }),
          ...(data.name && { name: data.name }),
        },
      });
      return E.right(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      if (error.code === 'P2025') {
        return E.left({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with id ${id} not found`,
        });
      }
      if (error.code === 'P2002') {
        return E.left({
          code: UserRepositoryErrorCode.DUPLICATE_EMAIL,
          message: 'A user with this email already exists',
        });
      }
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async delete(id: string): Promise<E.Either<UserRepositoryError, User>> {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      return E.right(this.mapPrismaUserToEntity(user));
    } catch (error: any) {
      if (error.code === 'P2025') {
        return E.left({
          code: UserRepositoryErrorCode.NOT_FOUND,
          message: `User with id ${id} not found`,
        });
      }
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }

  async exists(id: string): Promise<E.Either<UserRepositoryError, boolean>> {
    try {
      const count = await this.prisma.user.count({
        where: { id },
      });
      return E.right(count > 0);
    } catch (error: any) {
      return E.left({
        code: UserRepositoryErrorCode.DATABASE_ERROR,
        message: error.message || 'Database operation failed',
      });
    }
  }
}
