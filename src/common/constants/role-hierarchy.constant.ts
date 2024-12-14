import { Role } from '@common/enum/roles.enum';

export const ROLE_HIERARCHY: { [key in Role]?: Role[] } = {
  [Role.SUPER_ADMIN]: [
    Role.ADMIN,
    Role.SUPPORT,
    Role.ORGANIZATION_ADMIN,
    Role.DOCUMENT_MANAGER,
    Role.VERIFIER,
    Role.REVIEWER,
    Role.MEMBER,
    Role.VIEWER,
    Role.AUDITOR,
    Role.USER,
  ],
  [Role.ADMIN]: [
    Role.SUPPORT,
    Role.ORGANIZATION_ADMIN,
    Role.DOCUMENT_MANAGER,
    Role.VERIFIER,
    Role.REVIEWER,
    Role.MEMBER,
    Role.VIEWER,
    Role.AUDITOR,
    Role.USER,
  ],
  [Role.ORGANIZATION_ADMIN]: [
    Role.DOCUMENT_MANAGER,
    Role.VERIFIER,
    Role.REVIEWER,
    Role.MEMBER,
    Role.VIEWER,
    Role.USER,
  ],
};
