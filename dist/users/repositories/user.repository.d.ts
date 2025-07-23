import { Prisma } from '@prisma/client';
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
export declare class UserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapPrismaUserToEntity;
    create(data: CreateUserDto): Promise<E.Either<UserRepositoryError, User>>;
    createWithinTransaction(data: CreateUserDto, tx: Prisma.TransactionClient): Promise<E.Either<UserRepositoryError, User>>;
    findAll(): Promise<E.Either<UserRepositoryError, User[]>>;
    findById(id: string): Promise<E.Either<UserRepositoryError, User>>;
    findByEmail(email: string): Promise<E.Either<UserRepositoryError, User>>;
    update(id: string, data: UpdateUserDto): Promise<E.Either<UserRepositoryError, User>>;
    updateWithinTransaction(id: string, data: UpdateUserDto, tx: Prisma.TransactionClient): Promise<E.Either<UserRepositoryError, User>>;
    delete(id: string): Promise<E.Either<UserRepositoryError, User>>;
    exists(id: string): Promise<E.Either<UserRepositoryError, boolean>>;
}
