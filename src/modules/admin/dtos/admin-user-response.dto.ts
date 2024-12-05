import { AdminRole } from '../entities/admin-user.entity';

export class AdminUserResponseDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: AdminRole;
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
