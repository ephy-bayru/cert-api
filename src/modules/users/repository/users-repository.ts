import { Injectable, ConflictException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { BaseRepository } from 'src/core/repository/base.repository';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { UserStatus } from '../entities/user-status.entity';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource, logger: LoggerService) {
    super(dataSource, User, logger);
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    await this.checkUniqueFields(userData);
    const user = await this.create(userData);
    this.logger.log('User created', 'UsersRepository', { id: user.id });
    return user;
  }

  private async checkUniqueFields(userData: CreateUserDto): Promise<void> {
    const uniqueFields: (keyof CreateUserDto)[] = [
      'email',
      'userName',
      'fcn',
      'fin',
    ];
    const existingFields: string[] = [];

    for (const field of uniqueFields) {
      if (userData[field]) {
        const exists = await this.exists({
          [field]: userData[field],
        } as FindOptionsWhere<User>);
        if (exists) {
          existingFields.push(field);
        }
      }
    }

    if (userData.address?.phoneNumber) {
      const phoneNumberExists = await this.phoneNumberExists(
        userData.address.phoneNumber,
      );
      if (phoneNumberExists) {
        existingFields.push('phoneNumber');
      }
    }

    if (existingFields.length > 0) {
      this.logger.warn(
        'Attempt to create user with existing fields',
        'UsersRepository',
        { existingFields },
      );
      throw new ConflictException(
        `The following fields already exist: ${existingFields.join(', ')}`,
      );
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      this.logger.warn('User not found', 'UsersRepository', { id });
    }
    return user;
  }

  async getUsers(
    paginationOptions: PaginationOptions<User>,
  ): Promise<PaginationResult<User>> {
    return this.findAll(paginationOptions);
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    await this.update(id, updateData);
    this.logger.log('User updated', 'UsersRepository', { id });
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    await this.update(id, { status: UserStatus.DELETED });
    this.logger.log('User deleted', 'UsersRepository', { id });
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    const queryBuilder = this.repository.createQueryBuilder('user');
    queryBuilder.where('LOWER(user.email) = :email', {
      email: email.trim().toLowerCase(),
    });
    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }
    return queryBuilder.getOne();
  }

  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email: email.trim().toLowerCase() });
  }

  async userNameExists(userName: string): Promise<boolean> {
    return this.exists({ userName: userName.trim() });
  }

  async fcnExists(fcn: string): Promise<boolean> {
    return this.exists({ fcn });
  }

  async finExists(fin: string): Promise<boolean> {
    return this.exists({ fin });
  }

  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    return this.exists({ address: { phoneNumber } } as FindOptionsWhere<User>);
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<void> {
    await this.update(id, { status });
    this.logger.log('User status updated', 'UsersRepository', {
      id,
      status,
    });
  }

  async searchUsers(
    query: string,
    paginationOptions: PaginationOptions<User>,
  ): Promise<PaginationResult<User>> {
    const where: FindOptionsWhere<User>[] = [
      { email: ILike(`%${query}%`) },
      { userName: ILike(`%${query}%`) },
      { fcn: ILike(`%${query}%`) },
      { fin: ILike(`%${query}%`) },
      { address: { phoneNumber: ILike(`%${query}%`) } },
    ];
    return this.findAll({ ...paginationOptions, options: { where } });
  }

  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.repository.increment({ id }, 'failedLoginAttempts', 1);
    this.logger.warn('Failed login attempt', 'UsersRepository', { id });
  }

  async getUsersByStatus(
    status: UserStatus,
    paginationOptions: PaginationOptions<User>,
  ): Promise<PaginationResult<User>> {
    return this.findAll({
      ...paginationOptions,
      options: { where: { status } },
    });
  }
}
