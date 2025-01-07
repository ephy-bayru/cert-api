import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AdminUsersRepository } from '@modules/admin/repositories/admin-users.repository';
import { OrganizationUsersRepository } from '@modules/organizations/repository/organization-users.repository';
import { UsersRepository } from '@modules/users/repository/users-repository';
import { OrganizationStatus } from '@modules/organizations/entities/organization-status.enum';
import { GlobalRole } from '@common/enums/global-role.enum';

export type LoginPayload = {
  id: string;
  role: GlobalRole[];
  email?: string;
  userName?: string;
  fullName?: string;
  organizationId?: string;
  twoFactorEnabled?: boolean;
  additionalInfo?: Record<string, any>;
};

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(
    private readonly adminRepo: AdminUsersRepository,
    private readonly orgRepo: OrganizationUsersRepository,
    private readonly userRepo: UsersRepository,
  ) {}

  // 1. Admin user validation
  async validateForAdmin(
    email: string,
    password: string,
  ): Promise<LoginPayload | null> {
    const adminUser = await this.adminRepo.findByEmail(email);
    if (!adminUser) {
      this.logger.debug(`Admin user not found by email: ${email}`);
      return null;
    }

    const match = await bcrypt.compare(password, adminUser.password);
    if (!match) {
      this.logger.debug(`Invalid password for admin email: ${email}`);
      return null;
    }

    if (!adminUser.isActive) {
      this.logger.debug(`Admin user is not active: ${email}`);
      return null;
    }

    return {
      id: adminUser.id,
      role: adminUser.roles,
      email: adminUser.email,
      fullName:
        `${adminUser.firstName ?? ''} ${adminUser.lastName ?? ''}`.trim(),
      twoFactorEnabled: !!adminUser.twoFactorEnabled,
      // additionalInfo can be added here if needed
    };
  }

  // 2. Organization user validation
  async validateForOrgUser(
    email: string,
    password: string,
  ): Promise<LoginPayload | null> {
    const orgUser = await this.orgRepo.findByEmail(email);
    if (!orgUser) {
      this.logger.debug(`No organization user found by email: ${email}`);
      return null;
    }

    const match = await bcrypt.compare(password, orgUser.password);
    if (!match) {
      this.logger.debug(`Incorrect password for org user email: ${email}`);
      return null;
    }

    if (!orgUser.isActive) {
      this.logger.debug(`Org user is not active: ${email}`);
      return null;
    }
    if (orgUser.isLocked) {
      this.logger.debug(`Org user is locked: ${email}`);
      return null;
    }

    if (orgUser.organization?.status !== OrganizationStatus.ACTIVE) {
      this.logger.debug(
        `Organization is not ACTIVE for user: ${email}, status: ${orgUser.organization?.status}`,
      );
      return null;
    }

    return {
      id: orgUser.id,
      role: orgUser.roles, // orgUser.role is now an array of GlobalRole
      email: orgUser.email,
      fullName: `${orgUser.firstName ?? ''} ${orgUser.lastName ?? ''}`.trim(),
      organizationId: orgUser.organizationId,
      twoFactorEnabled: !!orgUser.twoFactorEnabled,
    };
  }

  // 3. Regular user validation
  async validateForRegularUser(
    email: string,
    password: string,
  ): Promise<LoginPayload | null> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      this.logger.debug(`Regular user not found by email: ${email}`);
      return null;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      this.logger.debug(`Invalid password for user email: ${email}`);
      return null;
    }

    if (user.isAccountLocked) {
      this.logger.debug(`Regular user is locked: ${email}`);
      return null;
    }

    return {
      id: user.id,
      role:
        user.roles && user.roles.length > 0
          ? user.roles
          : [GlobalRole.END_USER],
      // Fallback to [GlobalRole.END_USER] if no roles are assigned
      email: user.email,
      fullName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      twoFactorEnabled: !!user.twoFactorEnabled,
    };
  }
}
