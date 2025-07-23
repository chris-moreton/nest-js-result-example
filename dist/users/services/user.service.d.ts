import * as E from 'fp-ts/Either';
import { UserServiceErrorType } from '../../common/enums/error-codes.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserWithAuditDto } from '../dto/create-user-with-audit.dto';
import { UserRepository } from '../repositories/user.repository';
import { AuditLogRepository } from '../../audit/repositories/audit-log.repository';
export interface UserServiceError {
    type: UserServiceErrorType;
    message: string;
    details?: any;
}
export declare class UserService {
    private readonly userRepository;
    private readonly auditLogRepository;
    private readonly prisma;
    constructor(userRepository: UserRepository, auditLogRepository: AuditLogRepository, prisma: PrismaService);
    private mapRepositoryError;
    createUser(dto: CreateUserDto): Promise<E.Either<UserServiceError, User>>;
    findAllUsers(): Promise<E.Either<UserServiceError, User[]>>;
    findUserById(id: string): Promise<E.Either<UserServiceError, User>>;
    updateUser(id: string, dto: UpdateUserDto): Promise<E.Either<UserServiceError, User>>;
    deleteUser(id: string): Promise<E.Either<UserServiceError, User>>;
    processUsers<T>(processor: (users: User[]) => T): Promise<E.Either<UserServiceError, T>>;
    findUsersBy(predicate: (user: User) => boolean): Promise<E.Either<UserServiceError, User[]>>;
    countUsers(): Promise<E.Either<UserServiceError, number>>;
    createUserWithAudit(dto: CreateUserWithAuditDto): Promise<E.Either<UserServiceError, User>>;
    updateUserWithAudit(id: string, dto: UpdateUserDto & {
        performedBy: string;
    }): Promise<E.Either<UserServiceError, User>>;
}
