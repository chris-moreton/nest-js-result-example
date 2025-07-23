import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class FunctionalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
    private createErrorResponse;
}
