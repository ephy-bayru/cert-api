import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TwoFAGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // assume request.user has 'twoFactorEnabled' or 'passedTwoFA' flags
    if (request.user.twoFactorEnabled && !request.user.passedTwoFA) {
      throw new ForbiddenException('2FA required but not verified.');
    }
    return true;
  }
}
