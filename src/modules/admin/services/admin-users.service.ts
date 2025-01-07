import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminUserDto } from '../dtos/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dtos/update-admin-user.dto';
import { AdminUserResponseDto } from '../dtos/admin-user-response.dto';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminUsersRepository } from '../repositories/admin-users.repository';
import { LoggerService } from '@common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Creates a new admin user.
   */
  async createAdminUser(
    adminUserData: CreateAdminUserDto,
    createdById: string,
  ): Promise<AdminUserResponseDto> {
    try {
      const adminUser = await this.adminUsersRepository.createAdminUser({
        ...adminUserData,
        createdBy: createdById,
      });

      // Log success with relevant context
      this.logger.log(
        `Admin user created: ${adminUser.email} (ID: ${adminUser.id})`,
        'AdminUsersService',
      );

      return this.toResponseDto(adminUser);
    } catch (error) {
      // Log error with context
      this.logger.error(
        `Failed to create admin user: ${adminUserData.email}`,
        'AdminUsersService',
        { error },
      );
      throw error;
    }
  }

  /**
   * Updates an existing admin user.
   */
  async updateAdminUser(
    id: string,
    updateData: UpdateAdminUserDto,
    updatedById: string,
  ): Promise<AdminUserResponseDto> {
    try {
      const adminUser = await this.adminUsersRepository.updateAdminUser(id, {
        ...updateData,
        updatedBy: updatedById,
      });

      this.logger.log('Admin user updated successfully', 'AdminUsersService', {
        adminUserId: adminUser.id,
      });

      return this.toResponseDto(adminUser);
    } catch (error) {
      this.logger.error('Failed to update admin user', 'AdminUsersService', {
        error,
      });
      throw error;
    }
  }

  /**
   * Deletes an admin user.
   */
  async deleteAdminUser(id: string, deletedById: string): Promise<void> {
    try {
      await this.adminUsersRepository.deleteAdminUser(id);

      this.logger.log('Admin user deleted successfully', 'AdminUsersService', {
        adminUserId: id,
        deletedById,
      });
    } catch (error) {
      this.logger.error('Failed to delete admin user', 'AdminUsersService', {
        error,
      });
      throw error;
    }
  }

  /**
   * Activates an admin user.
   */
  async activateAdminUser(id: string, activatedById: string): Promise<void> {
    try {
      await this.adminUsersRepository.activateAdminUser(id);

      this.logger.log(
        'Admin user activated successfully',
        'AdminUsersService',
        {
          adminUserId: id,
          activatedById,
        },
      );
    } catch (error) {
      this.logger.error('Failed to activate admin user', 'AdminUsersService', {
        error,
      });
      throw error;
    }
  }

  /**
   * Deactivates an admin user.
   */
  async deactivateAdminUser(
    id: string,
    deactivatedById: string,
  ): Promise<void> {
    try {
      await this.adminUsersRepository.deactivateAdminUser(id);

      this.logger.log(
        'Admin user deactivated successfully',
        'AdminUsersService',
        {
          adminUserId: id,
          deactivatedById,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to deactivate admin user',
        'AdminUsersService',
        {
          error,
        },
      );
      throw error;
    }
  }

  /**
   * Locks an admin user's account.
   */
  async lockAdminUserAccount(id: string): Promise<void> {
    try {
      await this.adminUsersRepository.lockAdminUserAccount(id);

      this.logger.log(
        'Admin user account locked successfully',
        'AdminUsersService',
        {
          adminUserId: id,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to lock admin user account',
        'AdminUsersService',
        {
          error,
        },
      );
      throw error;
    }
  }

  /**
   * Unlocks an admin user's account.
   */
  async unlockAdminUserAccount(
    id: string,
    unlockedById: string,
  ): Promise<void> {
    try {
      await this.adminUsersRepository.unlockAdminUserAccount(id);

      this.logger.log(
        'Admin user account unlocked successfully',
        'AdminUsersService',
        {
          adminUserId: id,
          unlockedById,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to unlock admin user account',
        'AdminUsersService',
        {
          error,
        },
      );
      throw error;
    }
  }

  /**
   * Finds an admin user by ID.
   */
  async findAdminUserById(id: string): Promise<AdminUserResponseDto> {
    try {
      const adminUser = await this.adminUsersRepository.findById(id);
      if (!adminUser) {
        throw new NotFoundException('Admin user not found');
      }
      return this.toResponseDto(adminUser);
    } catch (error) {
      this.logger.error(
        'Failed to find admin user by ID',
        'AdminUsersService',
        {
          error,
        },
      );
      throw error;
    }
  }

  /**
   * Finds an admin user by email.
   */
  async findAdminUserByEmail(
    email: string,
  ): Promise<AdminUserResponseDto | null> {
    try {
      const adminUser = await this.adminUsersRepository.findByEmail(email);
      if (!adminUser) {
        this.logger.log(
          `No admin user found for email: ${email}`,
          'AdminUsersService',
        );
        return null;
      }
      return this.toResponseDto(adminUser);
    } catch (error) {
      this.logger.error(
        'Failed to find admin user by email',
        'AdminUsersService',
        {
          error,
        },
      );
      throw error;
    }
  }

  /**
   * Lists admin users with pagination.
   */
  async listAdminUsers(
    options: PaginationOptions<AdminUser>,
  ): Promise<PaginationResult<AdminUserResponseDto>> {
    try {
      const adminUsers =
        await this.adminUsersRepository.listAdminUsers(options);

      this.logger.log('Admin users listed successfully', 'AdminUsersService', {
        total: adminUsers.total,
      });

      const data = adminUsers.data.map((adminUser) =>
        this.toResponseDto(adminUser),
      );

      return { ...adminUsers, data };
    } catch (error) {
      this.logger.error('Failed to list admin users', 'AdminUsersService', {
        error,
      });
      throw error;
    }
  }

  /**
   * Searches admin users based on a search term.
   */
  async searchAdminUsers(
    searchTerm: string,
    options: PaginationOptions<AdminUser>,
  ): Promise<PaginationResult<AdminUserResponseDto>> {
    try {
      const adminUsers = await this.adminUsersRepository.searchAdminUsers(
        searchTerm,
        options,
      );

      this.logger.log(
        'Admin users searched successfully',
        'AdminUsersService',
        {
          total: adminUsers.total,
        },
      );

      const data = adminUsers.data.map((adminUser) =>
        this.toResponseDto(adminUser),
      );

      return { ...adminUsers, data };
    } catch (error) {
      this.logger.error('Failed to search admin users', 'AdminUsersService', {
        error,
      });
      throw error;
    }
  }

/**
 * Converts an AdminUser entity to AdminUserResponseDto.
 */
private toResponseDto(adminUser: AdminUser): AdminUserResponseDto {
  const {
    password,
    deletedAt,
    deletedBy,
    updatedBy,
    createdBy,
    version,
    ...rest
  } = adminUser;
  return rest as AdminUserResponseDto;
}

}
