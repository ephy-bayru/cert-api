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
  implements NestInterceptor<T, CustomResponse<T | null>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<CustomResponse<T | null>> {
    return next
      .handle()
      .pipe(map((data) => this.transformResponse(context, data)));
  }

  private transformResponse(
    context: ExecutionContext,
    data: T,
  ): CustomResponse<T | null> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode;

    const customMessage =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      this.getDefaultMessage(statusCode);

    return {
      statusCode,
      message: customMessage,
      data: data ?? null,
      timestamp: new Date().toISOString(),
    };
  }

  private getDefaultMessage(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) {
      return 'Request successful';
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'Client error';
    } else if (statusCode >= 500) {
      return 'Server error';
    }
    return 'Request processed';
  }
}
