import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GlobalRole } from '@common/enums/global-role.enum';

export class OrganizationUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  // Profile Information
  @ApiProperty()
  email: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  middleName?: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  profileImageUrl?: string;

  // Professional Information
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  employeeId?: string;

  // Role and Status
  @ApiProperty()
  role: GlobalRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  permissions: {
    canVerifyDocuments: boolean;
    canManageUsers: boolean;
    canAccessDocuments: boolean;
    canManageSettings: boolean;
    documentTypes?: string[];
    verificationLimit?: number;
  };

  // Security Status
  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  twoFactorEnabled: boolean;

  // Activity Information
  @ApiPropertyOptional()
  lastLogin?: Date;

  @ApiPropertyOptional()
  lastAccess?: Date;

  @ApiProperty()
  activityLog?: {
    lastVerificationAt?: Date;
    verificationsToday?: number;
    totalVerifications?: number;
    lastDocumentAccess?: Date;
  };

  // Timestamps
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deactivatedAt?: Date;

  // Computed Properties
  @Expose()
  get fullName(): string {
    return this.middleName
      ? `${this.firstName} ${this.middleName} ${this.lastName}`
      : `${this.firstName} ${this.lastName}`;
  }

  @Expose()
  get isLocked(): boolean {
    return this.failedLoginAttempts >= 5;
  }

  @Expose()
  get verificationCapacityRemaining(): number {
    return (
      (this.permissions.verificationLimit || 0) -
      (this.activityLog?.verificationsToday || 0)
    );
  }

  // Exclude Sensitive Information
  @Exclude()
  password: string;

  @Exclude()
  resetPasswordToken: string;

  @Exclude()
  resetPasswordExpires: Date;

  @Exclude()
  twoFactorSecret: string;

  @Exclude()
  failedLoginAttempts: number;

  @Exclude()
  version: number;

  constructor(partial: Partial<OrganizationUserResponseDto>) {
    Object.assign(this, partial);
  }
}
