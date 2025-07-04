import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateOrganizationUserDto } from '../dtos/create-organization-user.dto';
import { UpdateOrganizationUserDto } from '../dtos/update-organization-user.dto';
import { OrganizationUser } from '../entities/organization-user.entity';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { LoggerService } from '@common/services/logger.service';
import { OrganizationUsersRepository } from '../repository/organization-users.repository';
import { OrganizationUserRole } from '../entities/organization-user-role.enum';

@Injectable()
export class OrganizationUserService {
  constructor(
    private readonly organizationUsersRepository: OrganizationUsersRepository,
    private readonly logger: LoggerService,
  ) {}

  async createOrganizationUser(
    organizationId: string,
    createUserDto: CreateOrganizationUserDto,
    createdById: string,
  ): Promise<OrganizationUser> {
    try {
      const user =
        await this.organizationUsersRepository.createOrganizationUser(
          organizationId,
          createUserDto,
          createdById,
        );
      this.logger.info(
        'Organization user created successfully',
        'OrganizationUserService',
        {
          userId: user.id,
        },
      );
      return user;
    } catch (error) {
      this.logger.error(
        'Failed to create organization user',
        'OrganizationUserService',
        {
          error,
        },
      );
      throw error;
    }
  }

  async updateOrganizationUser(
    userId: string,
    updateDto: UpdateOrganizationUserDto,
    updatedById: string,
  ): Promise<OrganizationUser> {
    try {
      const user =
        await this.organizationUsersRepository.updateOrganizationUser(
          userId,
          updateDto,
          updatedById,
        );
      this.logger.info(
        'Organization user updated successfully',
        'OrganizationUserService',
        {
          userId: user.id,
        },
      );
      return user;
    } catch (error) {
      this.logger.error(
        'Failed to update organization user',
        'OrganizationUserService',
        {
          error,
          userId,
        },
      );
      throw error;
    }
  }

  async activateOrganizationUser(
    userId: string,
    activatedById: string,
  ): Promise<void> {
    try {
      await this.organizationUsersRepository.activateOrganizationUser(
        userId,
        activatedById,
      );
      this.logger.info(
        'Organization user activated successfully',
        'OrganizationUserService',
        {
          userId,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to activate organization user',
        'OrganizationUserService',
        {
          error,
          userId,
        },
      );
      throw error;
    }
  }

  async deactivateOrganizationUser(
    userId: string,
    deactivatedById: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.organizationUsersRepository.deactivateOrganizationUser(
        userId,
        deactivatedById,
        reason,
      );
      this.logger.info(
        'Organization user deactivated successfully',
        'OrganizationUserService',
        {
          userId,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to deactivate organization user',
        'OrganizationUserService',
        {
          error,
          userId,
        },
      );
      throw error;
    }
  }

  async updateOrganizationUserRole(
    userId: string,
    role: OrganizationUserRole,
    updatedById: string,
  ): Promise<void> {
    try {
      await this.organizationUsersRepository.updateOrganizationUserRole(
        userId,
        role,
        updatedById,
      );
      this.logger.info(
        'Organization user role updated successfully',
        'OrganizationUserService',
        {
          userId,
          role,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to update organization user role',
        'OrganizationUserService',
        {
          error,
          userId,
        },
      );
      throw error;
    }
  }

  async lockOrganizationUserAccount(userId: string): Promise<void> {
    try {
      await this.organizationUsersRepository.lockOrganizationUserAccount(
        userId,
      );
      this.logger.info(
        'Organization user account locked successfully',
        'OrganizationUserService',
        {
          userId,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to lock organization user account',
        'OrganizationUserService',
        {
          error,
          userId,
        },
      );
      throw error;
    }
  }

  async unlockOrganizationUserAccount(
    userId: string,
    unlockedById: string,
  ): Promise<void> {
    try {
      await this.organizationUsersRepository.unlockOrganizationUserAccount(
        userId,
        unlockedById,
      );
      this.logger.info(
        'Organization user account unlocked successfully',
        'OrganizationUserService',
        {
          userId,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to unlock organization user account',
        'OrganizationUserService',
        {
          error,
          userId,
        },
      );
      throw error;
    }
  }

  async findOrganizationUserById(
    userId: string,
    includeInactive = false,
  ): Promise<OrganizationUser> {
    try {
      const user =
        await this.organizationUsersRepository.findOrganizationUserById(
          userId,
          includeInactive,
        );
      if (!user) {
        throw new NotFoundException('Organization user not found');
      }
      this.logger.info(
        'Organization user retrieved successfully',
        'OrganizationUserService',
        {
          userId,
        },
      );
      return user;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve organization user',
        'OrganizationUserService',
        {
          error,
          userId,
        },
      );
      throw error;
    }
  }

  async findOrganizationUserByEmail(
    organizationId: string,
    email: string,
  ): Promise<OrganizationUser> {
    try {
      const user =
        await this.organizationUsersRepository.findOrganizationUserByEmail(
          organizationId,
          email,
        );
      if (!user) {
        throw new NotFoundException('Organization user not found');
      }
      this.logger.info(
        'Organization user found by email',
        'OrganizationUserService',
        {
          email,
        },
      );
      return user;
    } catch (error) {
      this.logger.error(
        'Failed to find organization user by email',
        'OrganizationUserService',
        {
          error,
          email,
        },
      );
      throw error;
    }
  }

  async listOrganizationUsers(
    organizationId: string,
    options: PaginationOptions<OrganizationUser>,
  ): Promise<PaginationResult<OrganizationUser>> {
    try {
      const users =
        await this.organizationUsersRepository.listOrganizationUsers(
          organizationId,
          options,
        );
      this.logger.info(
        'Organization users listed successfully',
        'OrganizationUserService',
        {
          organizationId,
          total: users.total,
        },
      );
      return users;
    } catch (error) {
      this.logger.error(
        'Failed to list organization users',
        'OrganizationUserService',
        {
          error,
          organizationId,
        },
      );
      throw error;
    }
  }

  async searchOrganizationUsers(
    organizationId: string,
    searchTerm: string,
    options: PaginationOptions<OrganizationUser>,
  ): Promise<PaginationResult<OrganizationUser>> {
    try {
      const users =
        await this.organizationUsersRepository.searchOrganizationUsers(
          organizationId,
          searchTerm,
          options,
        );
      this.logger.info(
        'Organization users searched successfully',
        'OrganizationUserService',
        {
          organizationId,
          total: users.total,
        },
      );
      return users;
    } catch (error) {
      this.logger.error(
        'Failed to search organization users',
        'OrganizationUserService',
        {
          error,
          organizationId,
        },
      );
      throw error;
    }
  }
}
