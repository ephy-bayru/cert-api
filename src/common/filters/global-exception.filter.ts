import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../services/logger.service';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let errorResponse: Record<string, any>;

    // Determine if the exception is an HttpException or something else
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorResponse = this.getHttpExceptionResponse(exception, request);
    } else {
      // Non-HTTP Exceptions
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = this.getInternalServerErrorResponse(exception, request);
    }

    // Log the error
    this.logger.logError(`Error on ${request.method} ${request.url}`, {
      ...errorResponse,
      headers: request.headers,
      body: request.body,
    });

    // Send the response
    response.status(statusCode).json(errorResponse);
  }

  /**
   * Generates the response for HttpException errors
   */
  private getHttpExceptionResponse(exception: HttpException, request: Request) {
    const message = exception.message || exception.getResponse();
    return {
      statusCode: exception.getStatus(),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : JSON.stringify(message),
    };
  }

  /**
   * Generates the response for Internal Server Errors or other unknown exceptions
   */
  private getInternalServerErrorResponse(exception: unknown, request: Request) {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Internal Server Error',
      error: exception instanceof Error ? exception.message : exception,
    };
  }
}
