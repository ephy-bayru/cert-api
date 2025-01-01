/**
 * Defines a single global enum for all roles in the system,
 * covering both platform-level and organization-level roles,
 * plus end users.
 */
export enum GlobalRole {
  // System or Platform-Wide Roles
  PLATFORM_SUPER_ADMIN = 'PLATFORM_SUPER_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  SUPPORT = 'SUPPORT',

  // Organization Roles
  ORG_SUPER_ADMIN = 'ORG_SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  DOCUMENT_MANAGER = 'DOCUMENT_MANAGER',
  VERIFIER = 'VERIFIER',
  REVIEWER = 'REVIEWER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
  AUDITOR = 'AUDITOR',
  TEMPORARY = 'TEMPORARY',

  // Basic End-User Role
  END_USER = 'END_USER',
}

/**
 * Role hierarchy object listing which roles each top-level role inherits.
 * The user’s actual role can be used to derive if they have permissions for roles “below” them.
 */
export const GLOBAL_ROLE_HIERARCHY: Record<GlobalRole, GlobalRole[]> = {
  [GlobalRole.PLATFORM_SUPER_ADMIN]: [
    GlobalRole.PLATFORM_ADMIN,
    GlobalRole.SUPPORT,
    GlobalRole.ORG_SUPER_ADMIN,
    GlobalRole.ORG_ADMIN,
    GlobalRole.DOCUMENT_MANAGER,
    GlobalRole.VERIFIER,
    GlobalRole.REVIEWER,
    GlobalRole.MEMBER,
    GlobalRole.VIEWER,
    GlobalRole.AUDITOR,
    GlobalRole.TEMPORARY,
    GlobalRole.END_USER,
  ],

  [GlobalRole.PLATFORM_ADMIN]: [
    GlobalRole.SUPPORT,
    GlobalRole.ORG_SUPER_ADMIN,
    GlobalRole.ORG_ADMIN,
    GlobalRole.DOCUMENT_MANAGER,
    GlobalRole.VERIFIER,
    GlobalRole.REVIEWER,
    GlobalRole.MEMBER,
    GlobalRole.VIEWER,
    GlobalRole.AUDITOR,
    GlobalRole.TEMPORARY,
    GlobalRole.END_USER,
  ],

  [GlobalRole.SUPPORT]: [], // If you want SUPPORT to inherit nothing else

  [GlobalRole.ORG_SUPER_ADMIN]: [
    GlobalRole.ORG_ADMIN,
    GlobalRole.DOCUMENT_MANAGER,
    GlobalRole.VERIFIER,
    GlobalRole.REVIEWER,
    GlobalRole.MEMBER,
    GlobalRole.VIEWER,
    GlobalRole.AUDITOR,
    GlobalRole.TEMPORARY,
  ],

  [GlobalRole.ORG_ADMIN]: [
    GlobalRole.DOCUMENT_MANAGER,
    GlobalRole.VERIFIER,
    GlobalRole.REVIEWER,
    GlobalRole.MEMBER,
    GlobalRole.VIEWER,
    GlobalRole.AUDITOR,
    GlobalRole.TEMPORARY,
  ],

  [GlobalRole.DOCUMENT_MANAGER]: [
    GlobalRole.VERIFIER,
    GlobalRole.REVIEWER,
    GlobalRole.MEMBER,
    GlobalRole.VIEWER,
  ],

  [GlobalRole.VERIFIER]: [GlobalRole.REVIEWER, GlobalRole.VIEWER],

  [GlobalRole.REVIEWER]: [GlobalRole.VIEWER],

  [GlobalRole.MEMBER]: [GlobalRole.VIEWER],

  [GlobalRole.VIEWER]: [],

  [GlobalRole.AUDITOR]: [
    // If you want auditors to see as “VIEWER,” you can add it:
    GlobalRole.VIEWER,
  ],

  [GlobalRole.TEMPORARY]: [],

  // Basic End-User role doesn’t necessarily get anything else unless you choose:
  [GlobalRole.END_USER]: [],
};
