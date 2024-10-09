import { Injectable } from '@nestjs/common';
import { UserResponseDto } from './user-response.dto';
import { User } from '../entities/user.entity';
import { AuthResponseDto } from './auth-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserMapper {
  constructor(private configService: ConfigService) {}

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
      surname: user.surname,
      provider: user.provider,
      dateOfBirth: user.dateOfBirth,
      nationality: user.nationality,
      sex: user.sex,
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
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
      expiresIn: this.configService.get<number>('JWT_EXPIRATION_TIME', 3600),
    };
  }
}
