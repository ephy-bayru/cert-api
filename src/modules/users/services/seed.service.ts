import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UsersService } from './users.service';
import { LoggerService } from 'src/common/services/logger.service';
import { ProviderType } from '../enums/provider-types';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('SeedService');
  }

  async onModuleInit(): Promise<void> {
    await this.seedUsers();
  }

  private async seedUsers() {
    this.logger.logInfo('Starting to seed users...');
    try {
      await this.createUserIfNotExists({
        email: 'fikru@cert.com',
        password: 'Taext@100!',
        firstName: 'Fikru',
        lastName: 'Hunegnaw',
        userName: 'fike',
        provider: ProviderType.Local,
      });

      await this.createUserIfNotExists({
        email: 'ephrem@cert.com',
        password: 'Cert@100!',
        firstName: 'Ephrem',
        lastName: 'Bayru',
        userName: 'ephrembayru',
        provider: ProviderType.Local,
      });

      this.logger.logInfo('Finished seeding users.');
    } catch (error) {
      this.logger.logError('An error occurred during the seeding process', {
        error: error.message,
      });
    }
  }

  private async createUserIfNotExists(userData: CreateUserDto) {
    try {
      const isUnique = await this.usersService.isEmailUnique(userData.email);
      if (isUnique) {
        await this.usersService.createUser(userData);
        this.logger.logInfo('User created successfully', {
          email: userData.email,
        });
      } else {
        this.logger.logInfo('User already exists', { email: userData.email });
      }
    } catch (error) {
      this.logger.logError('Failed to create or check user', {
        email: userData.email,
        error: error.message,
      });
      throw error;
    }
  }
}
