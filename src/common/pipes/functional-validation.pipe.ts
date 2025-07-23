import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Result } from '../utils/result';

export interface ValidationError {
  field: string;
  constraints: string[];
}

@Injectable()
export class FunctionalValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const validationResult = await this.validateObject(object);

    if (Result.isFailure(validationResult)) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationResult.error,
      });
    }

    return validationResult.value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private async validateObject(
    object: any,
  ): Promise<Result<any, ValidationError[]>> {
    const errors = await validate(object);

    if (errors.length > 0) {
      const validationErrors: ValidationError[] = errors.map((error) => ({
        field: error.property,
        constraints: Object.values(error.constraints || {}),
      }));
      return Result.failure(validationErrors);
    }

    return Result.success(object);
  }
}
