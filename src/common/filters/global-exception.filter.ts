import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../services/logger.service';
import { ConfigService } from '@nestjs/config';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { QueryFailedError } from 'typeorm';

@Injectable()
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

    const { statusCode, errorResponse } = this.getErrorDetails(
      exception,
      request,
    );

    // Log the error
    this.logger.error(
      `Error on ${request.method} ${request.url}`,
      'GlobalExceptionFilter',
      {
        ...errorResponse,
        headers: request.headers,
        body: request.body,
      },
    );

    // Send the response
    response.status(statusCode).json(errorResponse);
  }

  private getErrorDetails(
    exception: unknown,
    request: Request,
  ): { statusCode: number; errorResponse: Record<string, any> } {
    let statusCode: number;
    let errorResponse: Record<string, any>;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorResponse = this.getHttpExceptionResponse(exception, request);
    } else if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      errorResponse = this.getEntityNotFoundErrorResponse(exception, request);
    } else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorResponse = this.getQueryFailedErrorResponse(exception, request);
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = this.getInternalServerErrorResponse(exception, request);
    }

    return { statusCode, errorResponse };
  }

  private getHttpExceptionResponse(
    exception: HttpException,
    request: Request,
  ): Record<string, any> {
    const response = exception.getResponse();
    const message =
      typeof response === 'string'
        ? response
        : (response as any).message || exception.message;

    return {
      statusCode: exception.getStatus(),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
      error: exception.name,
      ...this.includeStackTrace(exception),
    };
  }

  private getEntityNotFoundErrorResponse(
    exception: EntityNotFoundError,
    request: Request,
  ): Record<string, any> {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: ['Entity not found'],
      error: exception.name,
      ...this.includeStackTrace(exception),
    };
  }

  private getQueryFailedErrorResponse(
    exception: QueryFailedError,
    request: Request,
  ): Record<string, any> {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: ['Database query failed'],
      error: exception.name,
      ...this.includeStackTrace(exception),
    };
  }

  private getInternalServerErrorResponse(
    exception: unknown,
    request: Request,
  ): Record<string, any> {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: ['Internal server error'],
      error: exception instanceof Error ? exception.name : 'UnknownError',
      ...this.includeStackTrace(exception),
    };
  }

  private includeStackTrace(exception: unknown): { stack?: string } {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    if (!isProduction && exception instanceof Error) {
      return { stack: exception.stack };
    }
    return {};
  }
}
