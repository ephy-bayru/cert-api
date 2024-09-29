import { UserStatus } from '../entities/user-status.entity';

export class UserResponseDto {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  isActive: boolean;
  role: string;
  status: UserStatus;
  firstName: string;
  lastName: string;
  provider: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
