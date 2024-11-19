import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationUser } from './entities/organization-user.entity';
import { OrganizationService } from './services/organizations.service';
import { OrganizationUserService } from './services/organization-users.service';
import { OrganizationsRepository } from './repository/organizations.repository';
import { OrganizationUsersRepository } from './repository/organization-users.repository';
import { OrganizationController } from './controllers/organizations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrganizationUser])],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationUserService,
    OrganizationsRepository,
    OrganizationUsersRepository,
  ],
  exports: [OrganizationService, OrganizationUserService],
})
export class OrganizationsModule {}
