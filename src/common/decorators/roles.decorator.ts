import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user-role.entity';

export const ROLES_KEY = 'roles';

export function Roles(...roles: UserRole[]): CustomDecorator<string> {
  if (roles.length === 0) {
    throw new Error('Roles decorator requires at least one role');
  }
  const uniqueRoles = [...new Set(roles)];
  return SetMetadata(ROLES_KEY, uniqueRoles);
}

// Usage example
export function GetRoles(target: any): UserRole[] {
  return Reflect.getMetadata(ROLES_KEY, target) || [];
}

export function HasRole(target: any, role: UserRole): boolean {
  const roles = GetRoles(target);
  return roles.includes(role);
}
