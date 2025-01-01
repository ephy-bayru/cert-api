import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, IsNull, Not } from 'typeorm';
import { BaseRepository } from '@core/repository/base.repository';
import { AdminUser } from '../entities/admin-user.entity';
import { LoggerService } from '@common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import * as bcrypt from 'bcrypt';
import { GlobalRole } from '@common/enums/global-role.enum';

@Injectable()
export class AdminUsersRepository extends BaseRepository<AdminUser> {
  constructor(
    dataSource: DataSource,
    protected readonly logger: LoggerService,
  ) {
    super(dataSource, AdminUser, logger);
  }

  /**
   * Creates a new admin user.
   */
  async createAdminUser(adminUserData: Partial<AdminUser>): Promise<AdminUser> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Normalize email
      if (adminUserData.email) {
        adminUserData.email = adminUserData.email.trim().toLowerCase();
      } else {
        throw new BadRequestException('Email is required.');
      }

      // Check email uniqueness
      const existingUser = await queryRunner.manager.findOne(AdminUser, {
        where: { email: adminUserData.email, deletedAt: IsNull() },
      });

      if (existingUser) {
        throw new ConflictException('Email is already in use.');
      }

      // Hash password
      if (adminUserData.password) {
        adminUserData.password = await bcrypt.hash(adminUserData.password, 12);
      }

      // Set default values
      if (!adminUserData.role) {
        adminUserData.role = GlobalRole.PLATFORM_ADMIN;
      }
      adminUserData.isActive = true;

      // Create admin user entity
      const adminUser = queryRunner.manager.create(AdminUser, adminUserData);

      // Save admin user
      await queryRunner.manager.save(adminUser);

      await queryRunner.commitTransaction();

      this.logger.log(
        'Admin user created successfully',
        'AdminUsersRepository',
        {
          adminUserId: adminUser.id,
        },
      );

      return adminUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError('Error creating admin user', error, { adminUserData });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Finds an admin user by ID.
   */
  async findById(id: string): Promise<AdminUser | null> {
    try {
      return await this.repository.findOne({
        where: { id, deletedAt: IsNull() },
      });
    } catch (error) {
      this.handleError('Error finding admin user by ID', error, { id });
    }
  }

  /**
   * Finds an admin user by email.
   */
  async findByEmail(email: string): Promise<AdminUser | null> {
    try {
      return await this.repository.findOne({
        where: { email: email.trim().toLowerCase(), deletedAt: IsNull() },
      });
    } catch (error) {
      this.handleError('Error finding admin user by email', error, { email });
    }
  }

  /**
   * Updates an existing admin user.
   */
  async updateAdminUser(
    id: string,
    updateData: Partial<AdminUser>,
  ): Promise<AdminUser> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const adminUser = await queryRunner.manager.findOne(AdminUser, {
        where: { id, deletedAt: IsNull() },
      });

      if (!adminUser) {
        throw new NotFoundException('Admin user not found.');
      }

      // Normalize email if it's being updated
      if (updateData.email) {
        updateData.email = updateData.email.trim().toLowerCase();
        // Check email uniqueness
        const existingUser = await queryRunner.manager.findOne(AdminUser, {
          where: { email: updateData.email, id: Not(id), deletedAt: IsNull() },
        });

        if (existingUser) {
          throw new ConflictException('Email is already in use.');
        }
      }

      // Hash new password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      // Update admin user
      Object.assign(adminUser, updateData);

      await queryRunner.manager.save(adminUser);

      await queryRunner.commitTransaction();

      this.logger.log(
        'Admin user updated successfully',
        'AdminUsersRepository',
        {
          adminUserId: adminUser.id,
        },
      );

      return adminUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError('Error updating admin user', error, { id, updateData });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Deletes an admin user (soft delete).
   */
  async deleteAdminUser(id: string): Promise<void> {
    try {
      await this.update(id, { deletedAt: new Date() });
    } catch (error) {
      this.handleError('Error deleting admin user', error, { id });
    }
  }

  /**
   * Activates an admin user.
   */
  async activateAdminUser(id: string): Promise<void> {
    try {
      await this.update(id, { isActive: true });
    } catch (error) {
      this.handleError('Error activating admin user', error, { id });
    }
  }

  /**
   * Deactivates an admin user.
   */
  async deactivateAdminUser(id: string): Promise<void> {
    try {
      await this.update(id, { isActive: false });
    } catch (error) {
      this.handleError('Error deactivating admin user', error, { id });
    }
  }

  /**
   * Locks an admin user's account.
   */
  async lockAdminUserAccount(id: string): Promise<void> {
    try {
      await this.update(id, { isLocked: true });
    } catch (error) {
      this.handleError('Error locking admin user account', error, { id });
    }
  }

  /**
   * Unlocks an admin user's account.
   */
  async unlockAdminUserAccount(id: string): Promise<void> {
    try {
      await this.update(id, { isLocked: false, failedLoginAttempts: 0 });
    } catch (error) {
      this.handleError('Error unlocking admin user account', error, { id });
    }
  }

  /**
   * Lists admin users with pagination.
   */
  async listAdminUsers(
    options: PaginationOptions<AdminUser>,
  ): Promise<PaginationResult<AdminUser>> {
    try {
      return await this.findAll(options);
    } catch (error) {
      this.handleError('Error listing admin users', error, { options });
    }
  }

  /**
   * Searches admin users based on a search term.
   */
  async searchAdminUsers(
    searchTerm: string,
    options: PaginationOptions<AdminUser>,
  ): Promise<PaginationResult<AdminUser>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('adminUser');
      queryBuilder.where('adminUser.deletedAt IS NULL');
      queryBuilder.andWhere(
        '(adminUser.firstName ILIKE :searchTerm OR adminUser.lastName ILIKE :searchTerm OR adminUser.email ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      );

      // Apply pagination and sorting
      const { page = 1, limit = 10, sort = [] } = options;
      queryBuilder.skip((page - 1) * limit);
      queryBuilder.take(limit);

      if (sort.length > 0) {
        sort.forEach(({ field, order }) => {
          queryBuilder.addOrderBy(`adminUser.${field}`, order);
        });
      } else {
        queryBuilder.addOrderBy('adminUser.createdAt', 'DESC');
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return { data, total, page, limit };
    } catch (error) {
      this.handleError('Error searching admin users', error, {
        searchTerm,
        options,
      });
    }
  }
}
