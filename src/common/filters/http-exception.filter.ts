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
import { ConfigService } from '@nestjs/config';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

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
      ...this.includeStackTrace(exception),
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

  /**
   * Helper method to extract exception message
   * @param exception
   */
  private getExceptionMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      return typeof exceptionResponse === 'object'
        ? JSON.stringify(exceptionResponse)
        : exception.message;
    }
    return 'Internal Server Error';
  }

  /**
   * Conditionally includes stack trace in the error response based on the environment.
   */
  private includeStackTrace(exception: unknown) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (exception instanceof HttpException && !isProduction) {
      return { stack: exception.stack };
    }

    return {};
  }
}
