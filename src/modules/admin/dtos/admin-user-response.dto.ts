import { GlobalRole } from "@common/enums/global-role.enum";

export class AdminUserResponseDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: GlobalRole[];
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
