import { IsNotEmpty, Length } from 'class-validator';

export class ChangeAdminUserPasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @Length(8, 128, {
    message: 'New password must be between 8 and 128 characters',
  })
  newPassword: string;
}
