import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    private handleServiceError;
    private handleResult;
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<User>;
    count(): Promise<{
        count: number;
    }>;
    filterUsers(filter: {
        name?: string;
        email?: string;
    }): Promise<User[]>;
}
