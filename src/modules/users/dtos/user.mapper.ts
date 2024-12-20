import { Injectable } from '@nestjs/common';
import { UserResponseDto } from './user-response.dto';
import { User } from '../entities/user.entity';
import { AuthResponseDto } from './auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '../entities/user-status.enum';

@Injectable()
export class UserMapper {
  constructor(private configService: ConfigService) {}

  toResponseDto(user: User): UserResponseDto {
    const isActive = user.status === UserStatus.ACTIVE;

    return new UserResponseDto({
      id: user.id,
      email: user.email,
      userName: user.userName,
      fullName: [user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim(),
      isActive,
      role: user.role,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      surname: user.surname,
      provider: user.provider,
      fcn: user.fcn,
      fin: user.fin,
      address: user.address
        ? {
            streetAddress: user.address.streetAddress,
            city: user.address.city,
            state: user.address.state,
            country: user.address.country,
            postalCode: user.address.postalCode,
            region: user.address.region,
            zone: user.address.zone,
            subCity: user.address.subCity,
            woreda: user.address.woreda,
            phoneNumber: user.address.phoneNumber,
          }
        : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
    });
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
      expiresIn: this.configService.get<number>('JWT_EXPIRATION_TIME', 3600),
    };
  }
}
