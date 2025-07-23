import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export interface ValidationError {
    field: string;
    constraints: string[];
}
export declare class FunctionalValidationPipe implements PipeTransform<any> {
    transform(value: any, { metatype }: ArgumentMetadata): Promise<any>;
    private toValidate;
    private validateObject;
}
