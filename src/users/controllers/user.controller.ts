import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService, UserServiceError } from '../services/user.service';
import { UserServiceErrorType } from '../../common/enums/error-codes.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserWithAuditDto } from '../dto/create-user-with-audit.dto';
import * as E from 'fp-ts/Either';
import { User } from '../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private handleServiceError(error: UserServiceError): never {
    const statusMap: Record<UserServiceErrorType, HttpStatus> = {
      [UserServiceErrorType.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
      [UserServiceErrorType.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [UserServiceErrorType.EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [UserServiceErrorType.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    throw new HttpException(
      {
        statusCode: statusMap[error.type],
        error: error.type,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
      statusMap[error.type],
    );
  }

  private async handleResult<T>(
    result: Promise<E.Either<UserServiceError, T>>,
  ): Promise<T> {
    const res = await result;
    if (E.isLeft(res)) {
      this.handleServiceError(res.left);
    }
    return res.right;
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.handleResult(this.userService.createUser(createUserDto));
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.handleResult(this.userService.findAllUsers());
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.handleResult(this.userService.findUserById(id));
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.handleResult(this.userService.updateUser(id, updateUserDto));
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<User> {
    return this.handleResult(this.userService.deleteUser(id));
  }

  // Additional functional endpoints
  @Get('search/count')
  async count(): Promise<{ count: number }> {
    const count = await this.handleResult(this.userService.countUsers());
    return { count };
  }

  @Post('search/filter')
  @UsePipes(new ValidationPipe({ transform: true }))
  async filterUsers(
    @Body() filter: { name?: string; email?: string },
  ): Promise<User[]> {
    return this.handleResult(
      this.userService.findUsersBy((user) => {
        if (
          filter.name &&
          !user.name.toLowerCase().includes(filter.name.toLowerCase())
        ) {
          return false;
        }
        return !(
          filter.email &&
          !user.email.toLowerCase().includes(filter.email.toLowerCase())
        );
      }),
    );
  }

  // Transactional endpoints with audit logging
  @Post('with-audit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createWithAudit(
    @Body() createUserDto: CreateUserWithAuditDto,
  ): Promise<User> {
    return this.handleResult(
      this.userService.createUserWithAudit(createUserDto),
    );
  }

  @Patch(':id/with-audit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateWithAudit(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto & { performedBy: string },
  ): Promise<User> {
    return this.handleResult(
      this.userService.updateUserWithAudit(id, updateDto),
    );
  }
}
