import { UserResponseDto } from '../../users/dtos/user-response.dto';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
  expiresIn: number;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
