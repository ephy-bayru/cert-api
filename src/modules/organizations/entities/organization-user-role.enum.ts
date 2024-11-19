export enum OrganizationUserRole {
  // Administrative Roles
  SUPER_ADMIN = 'SUPER_ADMIN', // Can manage everything including other admins
  ADMIN = 'ADMIN', // Can manage organization settings and users

  // Document Management Roles
  DOCUMENT_MANAGER = 'DOCUMENT_MANAGER', // Can manage all documents
  VERIFIER = 'VERIFIER', // Can verify documents
  REVIEWER = 'REVIEWER', // Can review but not verify documents

  // General User Roles
  MEMBER = 'MEMBER', // Regular member with standard access
  VIEWER = 'VIEWER', // Read-only access

  // Special Roles
  AUDITOR = 'AUDITOR', // Special access for audit purposes
  TEMPORARY = 'TEMPORARY', // Temporary access with expiration
}

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: [
    'ADMIN',
    'DOCUMENT_MANAGER',
    'VERIFIER',
    'REVIEWER',
    'MEMBER',
    'VIEWER',
    'AUDITOR',
  ],
  ADMIN: ['DOCUMENT_MANAGER', 'VERIFIER', 'REVIEWER', 'MEMBER', 'VIEWER'],
  DOCUMENT_MANAGER: ['VERIFIER', 'REVIEWER', 'MEMBER', 'VIEWER'],
  VERIFIER: ['REVIEWER', 'VIEWER'],
  REVIEWER: ['VIEWER'],
  MEMBER: ['VIEWER'],
  AUDITOR: ['VIEWER'],
};
