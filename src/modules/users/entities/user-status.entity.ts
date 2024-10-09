export enum UserStatus {
  // Active statuses
  ACTIVE = 'ACTIVE',
  VERIFIED = 'VERIFIED',

  // Inactive statuses
  INACTIVE = 'INACTIVE',
  DEACTIVATED = 'DEACTIVATED',

  // Pending statuses
  PENDING = 'PENDING',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  PENDING_APPROVAL = 'PENDING_APPROVAL',

  // Restricted statuses
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  RESTRICTED = 'RESTRICTED',

  // Special statuses
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',

  // Authentication-related statuses
  LOCKED = 'LOCKED',
  PASSWORD_RESET_REQUIRED = 'PASSWORD_RESET_REQUIRED',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',

  // Compliance-related statuses
  UNDER_REVIEW = 'UNDER_REVIEW',
  FLAGGED = 'FLAGGED',
}
