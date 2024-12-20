import { Injectable, ConflictException } from '@nestjs/common';
import {
  Brackets,
  DataSource,
  EntityManager,
  FindOptionsWhere,
  ILike,
  IsNull,
  QueryRunner,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { BaseRepository } from 'src/core/repository/base.repository';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { UserStatus } from '../entities/user-status.enum';
import { UserRole } from '../entities/user-role.enum';

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

    // Use the transaction method from BaseRepository
    return await this.transaction(async (queryRunner: QueryRunner) => {
      const userEntity = this.create({
        ...userData,
        role: UserRole.USER,
        status: UserStatus.PENDING_ACTIVATION,
      });

      const user = await queryRunner.manager.save(userEntity);
      this.logger.info('User created', 'UsersRepository', { userId: user.id });
      return user;
    });
  }

  /**
   * Checks for unique fields to prevent duplicates.
   */
  private async checkUniqueFields(userData: CreateUserDto): Promise<void> {
    const conditions: FindOptionsWhere<User>[] = [];

    if (userData.email) {
      conditions.push({
        email: userData.email.trim().toLowerCase(),
        deletedAt: IsNull(),
      });
    }
    if (userData.userName) {
      conditions.push({
        userName: userData.userName.trim(),
        deletedAt: IsNull(),
      });
    }
    if (userData.fcn) {
      conditions.push({ fcn: userData.fcn, deletedAt: IsNull() });
    }
    if (userData.fin) {
      conditions.push({ fin: userData.fin, deletedAt: IsNull() });
    }
    if (userData.address?.phoneNumber) {
      conditions.push({
        address: { phoneNumber: userData.address.phoneNumber },
        deletedAt: IsNull(),
      });
    }

    if (conditions.length === 0) return;

    const existingUser = await this.repository.findOne({ where: conditions });

    if (existingUser) {
      const existingFields = [];
      if (existingUser.email === userData.email) existingFields.push('email');
      if (existingUser.userName === userData.userName)
        existingFields.push('userName');
      if (existingUser.fcn === userData.fcn) existingFields.push('fcn');
      if (existingUser.fin === userData.fin) existingFields.push('fin');
      if (existingUser.address?.phoneNumber === userData.address?.phoneNumber)
        existingFields.push('phoneNumber');

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
    return await this.findOne({ where: { id, deletedAt: IsNull() } });
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
    this.logger.info('User updated', 'UsersRepository', { userId: id });
    return await this.getUserById(id);
  }

  /**
   * Marks a user as deleted.
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.repository.softRemove(user);
    this.logger.info('User soft-deleted', 'UsersRepository', { userId: id });
  }

  /**
   * Finds a user by email.
   */
  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', {
        email: email.trim().toLowerCase(),
      })
      .andWhere('user.deletedAt IS NULL');

    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }

    const user = await queryBuilder.getOne();
    return user || null;
  }

  /**
   * Updates the user's status.
   */
  async updateUserStatus(id: string, status: UserStatus): Promise<void> {
    const user = await this.getUserById(id);
    user.status = status;
    await this.save(user);
    this.logger.info('User status updated', 'UsersRepository', {
      userId: id,
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
    const { page = 1, limit = 10, sort = [] } = paginationOptions;

    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.address', 'address')
      .where('user.deletedAt IS NULL')
      .andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.email) LIKE :query', {
            query: `%${query.toLowerCase()}%`,
          })
            .orWhere('LOWER(user.userName) LIKE :query', {
              query: `%${query.toLowerCase()}%`,
            })
            .orWhere('user.fcn LIKE :query', { query: `%${query}%` })
            .orWhere('user.fin LIKE :query', { query: `%${query}%` })
            .orWhere('address.phoneNumber LIKE :query', {
              query: `%${query}%`,
            });
        }),
      )
      .skip((page - 1) * limit)
      .take(limit);

    // Apply sorting
    sort.forEach(({ field, order }) => {
      queryBuilder.addOrderBy(`user.${field}`, order);
    });

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Increments the failed login attempts counter.
   */
  async incrementFailedLoginAttempts(id: string): Promise<void> {
    const userExists = await this.exists({ id });
    if (userExists) {
      await this.repository.increment({ id }, 'failedLoginAttempts', 1);
      this.logger.warn('Failed login attempt', 'UsersRepository', {
        userId: id,
      });
    } else {
      this.logger.warn(
        'Attempted to increment failed login attempts for non-existent user',
        'UsersRepository',
        { userId: id },
      );
    }
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

  // Protected save method to enforce business rules
  public async save(entity: User): Promise<User> {
    return super.save(entity);
  }

  public async fieldExists(field: string, value: any): Promise<boolean> {
    const where = field
      .split('.')
      .reduceRight((value, key) => ({ [key]: value }), value);
    return await this.exists({ ...where, deletedAt: IsNull() });
  }
}
