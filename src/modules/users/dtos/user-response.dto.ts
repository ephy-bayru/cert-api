import { UserStatus } from '../entities/user-status.entity';
import { UserRole } from '../entities/user-role.entity';
import { ProviderType } from '../enums/provider-types';
import { AddressDto } from './address.dto';

export class UserResponseDto {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  isActive: boolean;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  surname?: string;
  provider: ProviderType;
  fcn?: string;
  fin?: string;
  address?: AddressDto;
  createdAt: Date;
  updatedAt: Date;
  dateOfBirth?: Date;
  gender?: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
