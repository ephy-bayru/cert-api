import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull, ILike, Not } from 'typeorm';
import { BaseRepository } from '@core/repository/base.repository';
import { User } from '@modules/users/entities/user.entity';
import { LoggerService } from '@common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@modules/users/entities/user-status.entity';

@Injectable()
export class UserManagementRepository extends BaseRepository<User> {
  constructor(
    dataSource: DataSource,
    protected readonly logger: LoggerService,
  ) {
    super(dataSource, User, logger);
  }

  /**
   * Retrieves a user by ID.
   */
  async findById(
    id: string,
    includeSensitiveData = false,
  ): Promise<User | null> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('user');
      queryBuilder.where('user.id = :id', { id });
      if (includeSensitiveData) {
        queryBuilder.addSelect(['user.password', 'user.twoFactorSecret']);
      }
      return await queryBuilder.getOne();
    } catch (error) {
      this.handleError('Error finding user by ID', error, { id });
    }
  }

  /**
   * Retrieves users with pagination and optional filters.
   */
  async getUsers(
    paginationOptions: PaginationOptions<User>,
    filters?: {
      status?: UserStatus;
      search?: string;
    },
  ): Promise<PaginationResult<User>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('user');
      queryBuilder.where('user.deletedAt IS NULL');

      if (filters?.status) {
        queryBuilder.andWhere('user.status = :status', {
          status: filters.status,
        });
      }

      if (filters?.search) {
        const search = `%${filters.search}%`;
        queryBuilder.andWhere(
          '(user.email ILIKE :search OR user.userName ILIKE :search)',
          { search },
        );
      }

      // Apply pagination
      const { page = 1, limit = 10, sort = [] } = paginationOptions;
      queryBuilder.skip((page - 1) * limit);
      queryBuilder.take(limit);

      // Apply sorting if provided
      if (sort && sort.length > 0) {
        sort.forEach(({ field, order }) => {
          queryBuilder.addOrderBy(`user.${field}`, order);
        });
      } else {
        queryBuilder.addOrderBy('user.createdAt', 'DESC');
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.handleError('Error retrieving users', error, {
        paginationOptions,
        filters,
      });
    }
  }

  /**
   * Activates a user account.
   */
  async activateUser(id: string): Promise<void> {
    try {
      await this.update(id, { status: UserStatus.ACTIVE });
    } catch (error) {
      this.handleError('Error activating user', error, { id });
    }
  }

  /**
   * Deactivates a user account.
   */
  async deactivateUser(id: string): Promise<void> {
    try {
      await this.update(id, { status: UserStatus.DEACTIVATED });
    } catch (error) {
      this.handleError('Error deactivating user', error, { id });
    }
  }

  /**
   * Locks a user's account.
   */
  async lockUserAccount(id: string): Promise<void> {
    try {
      await this.update(id, { isAccountLocked: true });
    } catch (error) {
      this.handleError('Error locking user account', error, { id });
    }
  }

  /**
   * Unlocks a user's account.
   */
  async unlockUserAccount(id: string): Promise<void> {
    try {
      await this.update(id, { isAccountLocked: false, failedLoginAttempts: 0 });
    } catch (error) {
      this.handleError('Error unlocking user account', error, { id });
    }
  }

  /**
   * Resets a user's password.
   */
  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await this.update(id, { password: hashedPassword });
    } catch (error) {
      this.handleError('Error resetting user password', error, { id });
    }
  }

  /**
   * Deletes a user account (soft delete).
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await this.update(id, { deletedAt: new Date() });
    } catch (error) {
      this.handleError('Error deleting user', error, { id });
    }
  }

  /**
   * Updates a user's details.
   */
  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    try {
      await this.update(id, updateData);
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new NotFoundException('User not found after update');
      }
      return updatedUser;
    } catch (error) {
      this.handleError('Error updating user', error, {
        id,
        updateData,
      });
    }
  }
}
