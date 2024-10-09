import { UsersService } from './users.service';
import { ProviderType } from '../enums/provider-types';
import { UserRole } from '../entities/user-role.entity';
import { UserStatus } from '../entities/user-status.entity';
import { ConfigService } from '@nestjs/config';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoggerService } from 'src/common/services/logger.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly userSeedData: Partial<CreateUserDto>[];

  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.userSeedData = [
      {
        email: 'admin@example.com',
        password: this.configService.get<string>(
          'ADMIN_PASSWORD',
          'AdminPassword',
        ),
        firstName: 'Admin',
        lastName: 'User',
        userName: 'admin',
        provider: ProviderType.Local,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        email: 'user1@example.com',
        password: this.configService.get<string>(
          'USER1_PASSWORD',
          'User1Password',
        ),
        firstName: 'User',
        lastName: 'One',
        userName: 'user1',
        provider: ProviderType.Local,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
      {
        email: 'user2@example.com',
        password: this.configService.get<string>(
          'USER2_PASSWORD',
          'User2Password',
        ),
        firstName: 'User',
        lastName: 'Two',
        userName: 'user2',
        provider: ProviderType.Local,
        role: UserRole.ORGANIZATION,
        status: UserStatus.ACTIVE,
      },
    ];
  }

  async onModuleInit(): Promise<void> {
    await this.seedUsers();
  }

  private async seedUsers(): Promise<void> {
    this.logger.log('Starting to seed users...', 'SeedService');
    try {
      for (const userData of this.userSeedData) {
        await this.createUserIfNotExists(userData);
      }
      this.logger.log('Finished seeding users.', 'SeedService');
    } catch (error) {
      this.logger.error(
        'An error occurred during the seeding process',
        'SeedService',
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  private async createUserIfNotExists(
    userData: Partial<CreateUserDto>,
  ): Promise<void> {
    try {
      await this.usersService.findByEmail(userData.email);
      this.logger.log('User already exists', 'SeedService', {
        email: userData.email,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        try {
          await this.usersService.createUser(userData as CreateUserDto);
          this.logger.log('User created successfully', 'SeedService', {
            email: userData.email,
          });
        } catch (createError) {
          this.logger.error('Failed to create user', 'SeedService', {
            email: userData.email,
            error:
              createError instanceof Error
                ? createError.message
                : String(createError),
          });
        }
      } else {
        this.logger.error('Failed to check if user exists', 'SeedService', {
          email: userData.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}
