import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { CustomResponse } from '../interfaces/ICustomeResponse';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, CustomResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<CustomResponse<T>> {
    const ctx = context.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    const customMessage =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ||
      'Request successful';

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;
        const responseData = (data ?? {}) as T;

        return {
          statusCode: statusCode,
          message: customMessage,
          data: responseData,
          timestamp: new Date().toISOString(),
        } as CustomResponse<T>;
      }),
    );
  }
}
