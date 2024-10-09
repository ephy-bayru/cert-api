export enum DocumentStatus {
  // Initial status when a document is first uploaded
  DRAFT = 'DRAFT',

  // User has submitted the document for review
  SUBMITTED = 'SUBMITTED',

  // Document is queued for review
  IN_QUEUE = 'IN_QUEUE',

  // Document is currently being reviewed
  UNDER_REVIEW = 'UNDER_REVIEW',

  // Additional information or changes requested by the reviewer
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',

  // Document has been verified and approved
  VERIFIED = 'VERIFIED',

  // Document has been rejected
  REJECTED = 'REJECTED',

  // Document was verified but has been revoked
  REVOKED = 'REVOKED',

  // Document has expired (e.g., past its validity date)
  EXPIRED = 'EXPIRED',

  // Document is pending renewal
  PENDING_RENEWAL = 'PENDING_RENEWAL',

  // Document is undergoing a dispute or challenge process
  UNDER_DISPUTE = 'UNDER_DISPUTE',

  // Document is archived (no longer active but kept for record)
  ARCHIVED = 'ARCHIVED',

  // Document is pending deletion (e.g., during a grace period before permanent deletion)
  PENDING_DELETION = 'PENDING_DELETION',
}
