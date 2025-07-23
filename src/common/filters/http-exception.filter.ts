import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error?: string;
  message?: string | string[];
  details?: any;
}

@Catch()
export class FunctionalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.createErrorResponse(exception, request);
    
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private createErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const baseResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return {
        ...baseResponse,
        statusCode: status,
        ...(typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse }),
      };
    }

    if (exception instanceof Error) {
      return {
        ...baseResponse,
        error: 'Internal Server Error',
        message: exception.message,
        ...(process.env.NODE_ENV === 'development' && { details: exception.stack }),
      };
    }

    return {
      ...baseResponse,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    };
  }
}