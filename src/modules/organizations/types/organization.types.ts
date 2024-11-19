export interface OrganizationMetadata {
  createdAt?: Date;
  initialSetup?: boolean;
  activationInfo?: {
    activatedAt: Date;
    activatedBy: string;
    reason?: string;
  };
  suspensionInfo?: {
    suspendedAt: Date;
    suspendedBy: string;
    reason: string;
  };
  [key: string]: any;
}

export interface OrganizationUserActivityLog {
  lastLogin?: Date;
  lastLoginIp?: string;
  loginCount?: number;
  organizationActivation?: {
    activatedAt: Date;
    activatedBy: string;
  };
  deactivation?: {
    deactivatedAt: Date;
    deactivatedBy: string;
    reason: string;
  };
  [key: string]: any;
}

export interface CreateInitialAdminUserParams {
  organizationId: string;
  email: string;
  password: string;
  createdById: string;
}
