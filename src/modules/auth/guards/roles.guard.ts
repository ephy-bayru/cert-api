import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@common/decorators/roles.decorator';
import {
  GlobalRole,
  GLOBAL_ROLE_HIERARCHY,
} from '@common/enums/global-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndMerge<GlobalRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role) {
      throw new ForbiddenException('No user or user.role found in request');
    }

    // If user’s top-level role or inherited roles match any required role => granted
    for (const requiredRole of requiredRoles) {
      if (this.hasRoleOrInherited(user.role, requiredRole)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User role '${user.role}' does not meet required roles: [${requiredRoles.join(', ')}]`,
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
