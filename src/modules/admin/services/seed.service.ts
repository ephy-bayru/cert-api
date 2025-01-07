import { Injectable, OnModuleInit } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from '../dtos/create-admin-user.dto';
import { GlobalRole } from '@common/enums/global-role.enum';
import { LoggerService } from '@common/services/logger.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
  }

  private async seedAdminUser(): Promise<void> {
    const adminEmail = 'abebe@docs.com';
    const desiredPassword = 'Abe_Kebe@92!';

    try {
      // 1. Attempt to find an existing admin user by email.
      const existingAdmin =
        await this.adminUsersService.findAdminUserByEmail(adminEmail);

      // 2. If found => log info + skip, else => create it
      if (existingAdmin) {
        this.logger.log(
          `Admin user already exists: ${adminEmail} (ID: ${existingAdmin.id})`,
          'SeedService',
        );
        return;
      }

      // 3. Since no user was found, proceed with creation.
      this.logger.info(
        `No admin user found for: ${adminEmail}. Proceeding with seeding...`,
        'SeedService',
      );

      const adminUserDto: CreateAdminUserDto = {
        email: adminEmail,
        password: desiredPassword,
        phoneNumber: '0912345678',
        firstName: 'Abebe',
        lastName: 'Kebede',
        userName: 'AbebeK',
        role: GlobalRole.PLATFORM_SUPER_ADMIN,
      };

      // 4. Actually create the user (pass system ID or similar for "createdBy").
      const createdAdmin = await this.adminUsersService.createAdminUser(
        adminUserDto,
        '00000000-0000-0000-0000-000000000000',
      );

      // 5. Log the successful creation of the admin user.
      this.logger.log(
        `Seeded a new admin user: ${createdAdmin.email} (ID: ${createdAdmin.id})`,
        'SeedService',
      );
    } catch (error) {
      // Log the error with context
      this.logger.error(
        `Error while seeding admin user: ${adminEmail}`,
        'SeedService',
        { error },
      );
    }
  }
}
