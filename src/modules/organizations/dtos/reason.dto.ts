import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReasonDto {
  @ApiProperty({ description: 'Reason for the action', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  reason: string;
}
