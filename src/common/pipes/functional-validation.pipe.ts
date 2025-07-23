import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as E from 'fp-ts/Either';

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

    if (E.isLeft(validationResult)) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationResult.left,
      });
    }

    return validationResult.right;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private async validateObject(
    object: any,
  ): Promise<E.Either<ValidationError[], any>> {
    const errors = await validate(object);

    if (errors.length > 0) {
      const validationErrors: ValidationError[] = errors.map((error) => ({
        field: error.property,
        constraints: Object.values(error.constraints || {}),
      }));
      return E.left(validationErrors);
    }

    return E.right(object);
  }
}
