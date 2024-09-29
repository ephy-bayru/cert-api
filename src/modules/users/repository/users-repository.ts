import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource, ILike, FindOptionsWhere } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { BaseRepository } from 'src/core/repository/base.repository';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import { LoggerService } from 'src/common/services/logger.service';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource, logger: LoggerService) {
    super(dataSource, User, logger);
    this.logger.setContext('UsersRepository');
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const emailExists = await this.emailExists(userData.email);
      if (emailExists) {
        this.logger.logWarn(`Email already in use: ${userData.email}`);
        throw new ConflictException(`Email already in use: ${userData.email}`);
      }

      const newUser = this.repository.create(userData);
      const savedUser = await this.repository.save(newUser);
      this.logger.logInfo('User created successfully', {
        userId: savedUser.id,
      });
      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.logError('Failed to create user', { error, userData });
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.repository.findOne({ where: { id } });
      if (!user) {
        this.logger.logWarn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User not found with ID: ${id}`);
      }
      this.logger.logInfo('User retrieved successfully', { userId: id });
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.logError(`Failed to retrieve user with ID: ${id}`, { error });
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async getUsers(page = 1, limit = 10): Promise<PaginationResult<User>> {
    try {
      const [data, total] = await this.repository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      this.logger.logInfo('Users retrieved successfully', {
        page,
        limit,
        total,
      });

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.logError('Failed to retrieve users', { error });
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    try {
      await this.repository.update({ id }, updateData);
      const updatedUser = await this.getUserById(id);
      this.logger.logInfo('User updated successfully', { userId: id });
      return updatedUser;
    } catch (error) {
      this.logger.logError(`Failed to update user with ID: ${id}`, { error });
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.getUserById(id);
      await this.repository.softRemove(user);
      this.logger.logInfo('User deleted successfully', { userId: id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.logError(`Failed to delete user with ID: ${id}`, { error });
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async restoreUser(id: string): Promise<void> {
    try {
      await this.repository.restore(id);
      this.logger.logInfo('User restored successfully', { userId: id });
    } catch (error) {
      this.logger.logError(`Failed to restore user with ID: ${id}`, { error });
      throw new InternalServerErrorException('Failed to restore user');
    }
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('user');

      queryBuilder.where('LOWER(user.email) = :email', {
        email: email.trim().toLowerCase(),
      });

      if (includePassword) {
        queryBuilder.addSelect('user.password');
      }

      const user = await queryBuilder.getOne();

      if (!user) {
        this.logger.logWarn(`No user found for email: ${email}`);
        return null;
      }

      this.logger.logInfo('User found by email', { email });
      return user;
    } catch (error) {
      this.logger.logError('Error finding user by email', { email, error });
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await this.repository.count({
        where: { email: email.trim().toLowerCase() },
      });
      this.logger.logDebug('Checked email existence', {
        email,
        exists: count > 0,
      });
      return count > 0;
    } catch (error) {
      this.logger.logError('Failed to check email existence', { email, error });
      throw new InternalServerErrorException('Failed to check email existence');
    }
  }

  async userNameExists(userName: string): Promise<boolean> {
    try {
      const count = await this.repository.count({
        where: { userName: userName.trim() },
      });
      this.logger.logDebug('Checked username existence', {
        userName,
        exists: count > 0,
      });
      return count > 0;
    } catch (error) {
      this.logger.logError('Failed to check username existence', {
        userName,
        error,
      });
      throw new InternalServerErrorException(
        'Failed to check username existence',
      );
    }
  }

  async deactivateUser(id: string): Promise<void> {
    try {
      const result = await this.repository.update(
        { id },
        { status: UserStatus.DEACTIVATED },
      );
      if (result.affected === 0) {
        this.logger.logWarn(
          `User not found or already deactivated with ID: ${id}`,
        );
        throw new NotFoundException(`User not found with ID: ${id}`);
      }
      this.logger.logInfo('User deactivated successfully', { userId: id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.logError(`Failed to deactivate user with ID: ${id}`, {
        error,
      });
      throw new InternalServerErrorException('Failed to deactivate user');
    }
  }

  async searchUsers(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<User>> {
    try {
      const where: FindOptionsWhere<User>[] = [
        { email: ILike(`%${query}%`) },
        { phoneNumber: ILike(`%${query}%`) },
        { userName: ILike(`%${query}%`) },
      ];

      const [data, total] = await this.repository.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      this.logger.logInfo('Users search completed', {
        query,
        page,
        limit,
        total,
      });

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.logError('An error occurred while searching for users', {
        query,
        error,
      });
      throw new InternalServerErrorException(
        'An error occurred while searching for users',
      );
    }
  }

  // Example: Increment failed login attempts
  async incrementFailedLoginAttempts(id: string): Promise<void> {
    try {
      await this.repository.increment({ id }, 'failedLoginAttempts', 1);
      this.logger.logInfo('Incremented failed login attempts', { userId: id });
    } catch (error) {
      this.logger.logError(
        `Failed to increment failed login attempts for user ID: ${id}`,
        { error },
      );
      throw new InternalServerErrorException(
        'Failed to update failed login attempts',
      );
    }
  }
}
