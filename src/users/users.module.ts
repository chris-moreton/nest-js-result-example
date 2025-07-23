import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user.repository';
import { AuditLogRepository } from '../audit/repositories/audit-log.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, AuditLogRepository],
  exports: [UserService],
})
export class UsersModule {}
