import { Injectable } from '@nestjs/common';
import { UserResponseDto } from './user-response.dto';
import { User } from '../entities/user.entity';
import { AuthResponseDto } from './auth-response.dto';

@Injectable()
export class UserMapper {
  toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      fullName: `${user.firstName} ${user.lastName}`,
      isActive: user.status === 'ACTIVE',
      role: user.role,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      provider: user.provider,
    };
  }

  toAuthResponseDto(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    return {
      accessToken,
      refreshToken,
      user: this.toResponseDto(user),
      expiresIn: Number(process.env.JWT_EXPIRATION_TIME),
    };
  }
}
