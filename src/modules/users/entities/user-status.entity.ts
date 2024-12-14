export enum UserStatus {
  // **Active statuses**
  /**
   * The user's account is active.
   */
  ACTIVE = 'ACTIVE',

  // **Inactive statuses**
  /**
   * The user's account is inactive.
   */
  INACTIVE = 'INACTIVE',

  // **Pending statuses**
  /**
   * The user is pending activation.
   */
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',

  // **Restricted statuses**
  /**
   * The user's account is suspended.
   */
  SUSPENDED = 'SUSPENDED',

  // **Special statuses**
  /**
   * The user's account is archived.
   */
  ARCHIVED = 'ARCHIVED',
  /**
   * The user's account is deleted.
   */
  DELETED = 'DELETED',

  // **Authentication-related statuses**
  /**
   * The user's account is locked.
   */
  LOCKED = 'LOCKED',
  /**
   * The user is required to reset their password.
   */
  PASSWORD_RESET_REQUIRED = 'PASSWORD_RESET_REQUIRED',
  /**
   * Two-factor authentication is required.
   */
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',

  // **Compliance-related statuses**
  /**
   * The user's account is under review.
   */
  UNDER_REVIEW = 'UNDER_REVIEW',
  /**
   * The user's account has been flagged.
   */
  FLAGGED = 'FLAGGED',
}
