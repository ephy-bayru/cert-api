import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { maskSensitiveData } from '../utils/mask-utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    const method = request.method;
    const url = request.url;
    const clientIp =
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    // Mask sensitive data in body and query parameters
    const body = maskSensitiveData(request.body);
    const queryParams = maskSensitiveData(request.query);

    this.logger.log(
      `Incoming Request: [${method}] ${url}`,
      'LoggingInterceptor',
      {
        ip: clientIp,
        userAgent,
        body,
        queryParams,
        pathParams: request.params,
      },
    );

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const statusCode = response.statusCode;
          const delay = Date.now() - now;
          // Log the outgoing response
          this.logger.log(
            `Outgoing Response: [${method}] ${url} - Status: ${statusCode} - ${delay}ms`,
            'LoggingInterceptor',
            {
              responseBody: this.safeStringify(responseBody),
              statusCode,
            },
          );
        },
        error: (error) => {
          const statusCode = error.status || response.statusCode || 500;
          const delay = Date.now() - now;
          // Log the error response
          this.logger.error(
            `Error Response: [${method}] ${url} - Status: ${statusCode} - ${delay}ms`,
            'LoggingInterceptor',
            {
              errorMessage: error.message,
              statusCode,
              stack: error.stack,
            },
          );
        },
      }),
    );
  }

  private safeStringify(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return '[Unable to stringify response]';
    }
  }
}
