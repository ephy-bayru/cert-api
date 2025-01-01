import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

import { OrganizationUsersRepository } from '@modules/organizations/repository/organization-users.repository';
import { AdminUsersRepository } from '@modules/admin/repositories/admin-users.repository';
import { UsersRepository } from '@modules/users/repository/users-repository';

import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repository/auth.repository';
// import { LocalStrategy } from './strategies/local.strategy'; // optional

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'SUPER_SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    AdminUsersRepository,
    OrganizationUsersRepository,
    UsersRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
