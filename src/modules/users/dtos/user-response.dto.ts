import { GlobalRole } from '@common/enums/global-role.enum';
import { UserStatus } from '../entities/user-status.enum';
import { ProviderType } from '../enums/provider-types';
import { AddressDto } from './address.dto';

export class UserResponseDto {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  isActive: boolean;
  roles: GlobalRole[];
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
