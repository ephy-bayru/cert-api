import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { BaseRepository } from 'src/core/repository/base.repository';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { UserStatus } from '../entities/user-status.entity';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource, logger: LoggerService) {
    super(dataSource, User, logger);
  }

  /**
   * Creates a new user with default role and status.
   * Ensures unique fields are not duplicated.
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    await this.checkUniqueFields(userData);

    // Set default role and status
    const userEntity = this.create({
      ...userData,
      role: UserRole.USER,
      status: UserStatus.PENDING_ACTIVATION,
    });

    const user = await this.save(userEntity);
    this.logger.log('User created', 'UsersRepository', { id: user.id });
    return user;
  }

  // Ensure 'save' method is accessible from BaseRepository
  public async save(entity: User): Promise<User> {
    return super.save(entity);
  }

  /**
   * Checks for unique fields to prevent duplicates.
   */
  private async checkUniqueFields(userData: CreateUserDto): Promise<void> {
    const uniqueFields: (keyof CreateUserDto & keyof User)[] = [
      'email',
      'userName',
      'fcn',
      'fin',
    ];
    const existingFields: string[] = [];

    for (const field of uniqueFields) {
      const value = userData[field];
      if (value) {
        const exists = await this.exists({
          [field]: value,
          deletedAt: IsNull(),
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

  /**
   * Retrieves a user by ID, ensuring they are not soft-deleted.
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!user) {
      this.logger.warn('User not found', 'UsersRepository', { id });
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Retrieves paginated users.
   */
  async getUsers(
    paginationOptions: PaginationOptions<User>,
  ): Promise<PaginationResult<User>> {
    return this.findAll(paginationOptions);
  }

  /**
   * Updates user information.
   */
  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    await this.update(id, updateData);
    this.logger.log('User updated', 'UsersRepository', { id });
    return this.getUserById(id);
  }

  /**
   * Marks a user as deleted.
   */
  async deleteUser(id: string): Promise<void> {
    await this.update(id, { status: UserStatus.DELETED });
    this.logger.log('User deleted', 'UsersRepository', { id });
  }

  /**
   * Finds a user by email.
   */
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

  /**
   * Checks if an email is already in use.
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists({
      email: email.trim().toLowerCase(),
      deletedAt: IsNull(),
    });
  }

  /**
   * Checks if a username is already in use.
   */
  async userNameExists(userName: string): Promise<boolean> {
    return this.exists({
      userName: userName.trim(),
      deletedAt: IsNull(),
    });
  }

  /**
   * Checks if an FCN is already in use.
   */
  async fcnExists(fcn: string): Promise<boolean> {
    return this.exists({
      fcn,
      deletedAt: IsNull(),
    });
  }

  /**
   * Checks if a FIN is already in use.
   */
  async finExists(fin: string): Promise<boolean> {
    return this.exists({
      fin,
      deletedAt: IsNull(),
    });
  }

  /**
   * Checks if a phone number is already in use.
   */
  async phoneNumberExists(phoneNumber: string): Promise<boolean> {
    return this.exists({
      address: { phoneNumber },
      deletedAt: IsNull(),
    } as FindOptionsWhere<User>);
  }

  /**
   * Updates the user's status.
   */
  async updateUserStatus(id: string, status: UserStatus): Promise<void> {
    await this.update(id, { status });
    this.logger.log('User status updated', 'UsersRepository', {
      id,
      status,
    });
  }

  /**
   * Searches for users based on a query string.
   */
  async searchUsers(
    query: string,
    paginationOptions: PaginationOptions<User>,
  ): Promise<PaginationResult<User>> {
    const where: FindOptionsWhere<User>[] = [
      { email: ILike(`%${query}%`), deletedAt: IsNull() },
      { userName: ILike(`%${query}%`), deletedAt: IsNull() },
      { fcn: ILike(`%${query}%`), deletedAt: IsNull() },
      { fin: ILike(`%${query}%`), deletedAt: IsNull() },
      { address: { phoneNumber: ILike(`%${query}%`) }, deletedAt: IsNull() },
    ];
    return this.findAll({ ...paginationOptions, options: { where } });
  }

  /**
   * Increments the failed login attempts counter.
   */
  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.repository.increment({ id }, 'failedLoginAttempts', 1);
    this.logger.warn('Failed login attempt', 'UsersRepository', { id });
  }

  /**
   * Retrieves users by their status.
   */
  async getUsersByStatus(
    status: UserStatus,
    paginationOptions: PaginationOptions<User>,
  ): Promise<PaginationResult<User>> {
    return this.findAll({
      ...paginationOptions,
      options: { where: { status, deletedAt: IsNull() } },
    });
  }
}
