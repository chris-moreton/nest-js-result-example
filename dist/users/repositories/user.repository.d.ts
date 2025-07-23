import { Result } from '../../common/utils/result';
import { UserRepositoryErrorCode } from '../../common/enums/error-codes.enum';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
export interface UserRepositoryError {
    code: UserRepositoryErrorCode;
    message: string;
}
export declare class UserRepository {
    private prisma;
    constructor();
    private mapPrismaUserToEntity;
    create(data: CreateUserDto): Promise<Result<User, UserRepositoryError>>;
    findAll(): Promise<Result<User[], UserRepositoryError>>;
    findById(id: string): Promise<Result<User, UserRepositoryError>>;
    findByEmail(email: string): Promise<Result<User, UserRepositoryError>>;
    update(id: string, data: UpdateUserDto): Promise<Result<User, UserRepositoryError>>;
    delete(id: string): Promise<Result<User, UserRepositoryError>>;
    exists(id: string): Promise<Result<boolean, UserRepositoryError>>;
}
