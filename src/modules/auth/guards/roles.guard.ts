import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import {
  GlobalRole,
  GLOBAL_ROLE_HIERARCHY,
} from '@common/enums/global-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Proceed with normal role checks if not public
    const requiredRoles = this.reflector.getAllAndMerge<GlobalRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || (!user.roles && !user.role)) {
      throw new ForbiddenException('No user or user.roles found in request');
    }

    const userRoles: GlobalRole[] = user.roles ?? [user.role];

    for (const requiredRole of requiredRoles) {
      for (const userRole of userRoles) {
        if (this.hasRoleOrInherited(userRole, requiredRole)) {
          return true;
        }
      }
    }

    throw new ForbiddenException(
      `User roles '${userRoles.join(', ')}' do not meet required roles: [${requiredRoles.join(', ')}]`,
    );
  }

  private hasRoleOrInherited(
    userRole: GlobalRole,
    requiredRole: GlobalRole,
  ): boolean {
    if (userRole === requiredRole) return true;
    const inherited = GLOBAL_ROLE_HIERARCHY[userRole] || [];
    return inherited.includes(requiredRole);
  }
}
