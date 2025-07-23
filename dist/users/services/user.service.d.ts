import { Result } from '../../common/utils/result';
import { UserServiceErrorType } from '../../common/enums/error-codes.enum';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../repositories/user.repository';
export interface UserServiceError {
    type: UserServiceErrorType;
    message: string;
    details?: any;
}
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    private mapRepositoryError;
    createUser(dto: CreateUserDto): Promise<Result<User, UserServiceError>>;
    findAllUsers(): Promise<Result<User[], UserServiceError>>;
    findUserById(id: string): Promise<Result<User, UserServiceError>>;
    updateUser(id: string, dto: UpdateUserDto): Promise<Result<User, UserServiceError>>;
    deleteUser(id: string): Promise<Result<User, UserServiceError>>;
    processUsers<T>(processor: (users: User[]) => T): Promise<Result<T, UserServiceError>>;
    findUsersBy(predicate: (user: User) => boolean): Promise<Result<User[], UserServiceError>>;
    countUsers(): Promise<Result<number, UserServiceError>>;
}
