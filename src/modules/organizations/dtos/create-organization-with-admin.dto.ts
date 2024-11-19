import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { CreateOrganizationDto } from './create-organization.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationWithAdminDto extends CreateOrganizationDto {
  @ApiProperty({ description: 'Admin user email' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ description: 'Admin user password' })
  @IsString()
  @IsNotEmpty()
  adminPassword: string;
}
