export enum OrganizationStatus {
  // Active States
  ACTIVE = 'ACTIVE',
  VERIFIED = 'VERIFIED',

  // Inactive States
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',

  // Pending States
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',

  // Compliance States
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLIANCE_HOLD = 'COMPLIANCE_HOLD',

  // Terminal States
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}
