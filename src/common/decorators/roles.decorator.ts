import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { GlobalRole } from '@common/enums/global-role.enum';

// Key under which the roles are stored in metadata
export const ROLES_KEY = 'roles';

/**
 * Defines a list of required roles for a route or class.
 *
 * Usage Example:
 *
 * ```ts
 * @Roles(GlobalRole.ORG_ADMIN, GlobalRole.VERIFIER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Patch('verify')
 * verifySomething(...) { ... }
 * ```
 */
export function Roles(...roles: GlobalRole[]): CustomDecorator<string> {
  if (roles.length === 0) {
    throw new Error('Roles decorator requires at least one role');
  }
  // remove duplicates just in case
  const uniqueRoles = [...new Set(roles)];
  return SetMetadata(ROLES_KEY, uniqueRoles);
}

/**
 * Helper function to retrieve roles (if any) from a class or method.
 * Typically used internally or for testing.
 */
export function GetRoles(target: any): GlobalRole[] {
  return Reflect.getMetadata(ROLES_KEY, target) || [];
}

/**
 * Helper to check if a given role is in the list of roles on the target.
 */
export function HasRole(target: any, role: GlobalRole): boolean {
  const roles = GetRoles(target);
  return roles.includes(role);
}
