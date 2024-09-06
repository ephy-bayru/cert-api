import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoggerService } from '../services/logger.service';
import { serialize } from '../utils/serialization-utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getExceptionMessage(exception),
      error:
        exception instanceof HttpException
          ? exception.name
          : 'InternalServerError',
    };

    this.logger.logError(
      `Error on ${request.method} ${request.url}`,
      {
        ...errorResponse,
        headers: request.headers,
        body: serialize(request.body),
      },
      exception instanceof HttpException ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  // Helper method to extract exception message
  private getExceptionMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message || JSON.stringify(exception.getResponse());
    }
    return 'Internal Server Error';
  }
}
