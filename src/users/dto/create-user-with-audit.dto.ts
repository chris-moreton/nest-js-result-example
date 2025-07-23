import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserWithAuditDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  performedBy: string; // Who is creating this user (e.g., admin email, system, etc.)
}