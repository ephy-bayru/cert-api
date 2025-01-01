import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';

// Entities
import { AdminUser } from './entities/admin-user.entity';

// Repositories
import { AdminUsersRepository } from './repositories/admin-users.repository';
import { UserManagementRepository } from './repositories/user-management.repository';
import { OrganizationManagementRepository } from './repositories/organization-management.repository';

// Services
import { AdminUsersService } from './services/admin-users.service';
import { UserManagementService } from './services/user-management.service';
import { OrganizationManagementService } from './services/organization-management.service';
import { AdminUsersController } from './controller/admin-users.controller';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { User } from '@modules/users/entities/user.entity';
import { SeedService } from './services/seed.service';

// Controllers

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, User, Organization]),
    CommonModule,
  ],
  controllers: [AdminUsersController],
  providers: [
    // Repositories
    AdminUsersRepository,
    UserManagementRepository,
    OrganizationManagementRepository,
    SeedService,
    // Services
    AdminUsersService,
    UserManagementService,
    OrganizationManagementService,
    // Common Services
  ],
  exports: [
    AdminUsersService,
    UserManagementService,
    OrganizationManagementService,
    AdminUsersRepository,
    UserManagementRepository,
    OrganizationManagementRepository,
    SeedService
  ],
})
export class AdminModule {}
