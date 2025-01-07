import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, ArrayUnique, IsEnum } from 'class-validator';
import { GlobalRole } from '@common/enums/global-role.enum';

/**
 * DTO for updating user roles.
 */
export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'Array of roles to assign to the user',
    enum: GlobalRole,
    isArray: true,
    example: [GlobalRole.VERIFIER, GlobalRole.REVIEWER],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Roles array cannot be empty' })
  @ArrayUnique({ message: 'Roles must be unique' })
  @IsEnum(GlobalRole, { each: true, message: 'Invalid role provided' })
  roles: GlobalRole[];
}
