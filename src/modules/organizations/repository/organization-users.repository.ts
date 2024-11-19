import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  IsNull,
  Not,
} from 'typeorm';
import { BaseRepository } from '@core/repository/base.repository';
import { LoggerService } from '@common/services/logger.service';
import { OrganizationUser } from '../entities/organization-user.entity';
import { Organization } from '../entities/organization.entity';
import { OrganizationUserRole } from '../entities/organization-user-role.enum';
import { CreateOrganizationUserDto } from '../dtos/create-organization-user.dto';
import { UpdateOrganizationUserDto } from '../dtos/update-organization-user.dto';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationUsersRepository extends BaseRepository<OrganizationUser> {
  constructor(
    dataSource: DataSource,
    protected readonly logger: LoggerService,
  ) {
    super(dataSource, OrganizationUser, logger);
  }

  // #region Organization User Management Methods

  /**
   * Creates a new user within an organization
   * Access: Organization Admin
   * Priority: High
   */
  async createOrganizationUser(
    organizationId: string,
    createUserDto: CreateOrganizationUserDto,
    createdById: string,
  ): Promise<OrganizationUser> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate organization existence and status
      const organization = await queryRunner.manager.findOne(Organization, {
        where: { id: organizationId, deletedAt: IsNull() },
      });

      if (!organization) {
        this.logger.warn(
          `Organization with ID '${organizationId}' not found`,
          'OrganizationUsersRepository',
        );
        throw new NotFoundException('Organization not found');
      }

      if (organization.status !== 'ACTIVE') {
        this.logger.warn(
          `Cannot add user to inactive organization '${organizationId}'`,
          'OrganizationUsersRepository',
        );
        throw new ConflictException(
          'Cannot add users to an inactive organization',
        );
      }

      // Check email uniqueness within the organization
      await this.validateUserEmailUniqueness(
        organizationId,
        createUserDto.email,
      );

      // Hash the password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      // Create user entity
      const user = queryRunner.manager.create(OrganizationUser, {
        ...createUserDto,
        organizationId,
        password: hashedPassword,
        isActive: true,
        createdBy: createdById,
      });

      // Save user
      await queryRunner.manager.save(user);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Log creation
      this.logger.info(
        `User '${user.email}' created in organization '${organizationId}' by user '${createdById}'`,
        'OrganizationUsersRepository',
        { userId: user.id, organizationId, createdById },
      );

      return user;
    } catch (error) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();

      // Log error
      this.logger.error(
        'Error creating organization user',
        'OrganizationUsersRepository',
        { error },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to create organization user',
        );
      }
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Updates an existing organization user
   * Access: Organization Admin / Self
   * Priority: High
   */
  async updateOrganizationUser(
    userId: string,
    updateDto: UpdateOrganizationUserDto,
    updatedById: string,
  ): Promise<OrganizationUser> {
    try {
      const user = await this.repository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });

      this.validateOrganizationUser(user);

      // If email is being updated, check for uniqueness
      if (updateDto.email && updateDto.email !== user.email) {
        await this.validateUserEmailUniqueness(
          user.organizationId,
          updateDto.email,
        );
      }

      // Hash new password if provided
      if (updateDto.newPassword) {
        updateDto.newPassword = await bcrypt.hash(updateDto.newPassword, 12);
      }

      // Update user fields
      Object.assign(user, updateDto);
      user.updatedBy = updatedById;
      user.updatedAt = new Date();

      await this.repository.save(user);

      // Log update
      this.logger.info(
        `User '${user.email}' updated by user '${updatedById}'`,
        'OrganizationUsersRepository',
        { userId: user.id, updatedById },
      );

      return user;
    } catch (error) {
      this.logger.error(
        'Error updating organization user',
        'OrganizationUsersRepository',
        { error },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to update organization user',
        );
      }
    }
  }

  /**
   * Activates an organization user
   * Access: Organization Admin
   * Priority: Medium
   */
  async activateOrganizationUser(
    userId: string,
    activatedById: string,
  ): Promise<void> {
    try {
      const user = await this.repository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });

      this.validateOrganizationUser(user);

      if (user.isActive) {
        this.logger.warn(
          `User '${user.email}' is already active`,
          'OrganizationUsersRepository',
        );
        throw new ConflictException('User is already active');
      }

      user.isActive = true;
      user.updatedBy = activatedById;
      user.updatedAt = new Date();

      await this.repository.save(user);

      // Log activation
      this.logger.info(
        `User '${user.email}' activated by user '${activatedById}'`,
        'OrganizationUsersRepository',
        { userId: user.id, activatedById },
      );
    } catch (error) {
      this.logger.error(
        'Error activating organization user',
        'OrganizationUsersRepository',
        { error },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to activate organization user',
        );
      }
    }
  }

  /**
   * Deactivates an organization user
   * Access: Organization Admin
   * Priority: Medium
   */
  async deactivateOrganizationUser(
    userId: string,
    deactivatedById: string,
    reason: string,
  ): Promise<void> {
    try {
      const user = await this.repository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });

      this.validateOrganizationUser(user);

      if (!user.isActive) {
        this.logger.warn(
          `User '${user.email}' is already inactive`,
          'OrganizationUsersRepository',
        );
        throw new ConflictException('User is already inactive');
      }

      user.isActive = false;
      user.deactivatedAt = new Date();
      user.deactivatedBy = deactivatedById;
      user.deactivationReason = reason;
      user.updatedBy = deactivatedById;
      user.updatedAt = new Date();

      await this.repository.save(user);

      // Log deactivation
      this.logger.info(
        `User '${user.email}' deactivated by user '${deactivatedById}' for reason '${reason}'`,
        'OrganizationUsersRepository',
        { userId: user.id, deactivatedById, reason },
      );
    } catch (error) {
      this.logger.error(
        'Error deactivating organization user',
        'OrganizationUsersRepository',
        { error },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to deactivate organization user',
        );
      }
    }
  }

  /**
   * Updates the role of an organization user
   * Access: Organization Admin
   * Priority: Medium
   */
  async updateOrganizationUserRole(
    userId: string,
    role: OrganizationUserRole,
    updatedById: string,
  ): Promise<void> {
    try {
      const user = await this.repository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });

      this.validateOrganizationUser(user);

      user.role = role;
      user.updatedBy = updatedById;
      user.updatedAt = new Date();

      await this.repository.save(user);

      // Log role update
      this.logger.info(
        `User '${user.email}' role updated to '${role}' by user '${updatedById}'`,
        'OrganizationUsersRepository',
        { userId: user.id, updatedById, role },
      );
    } catch (error) {
      this.logger.error(
        'Error updating organization user role',
        'OrganizationUsersRepository',
        { error },
      );

      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to update organization user role',
        );
      }
    }
  }

  /**
   * Locks an organization user's account
   * Access: Automatic / Organization Admin
   * Priority: Low
   */
  async lockOrganizationUserAccount(userId: string): Promise<void> {
    try {
      const user = await this.repository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });

      this.validateOrganizationUser(user);

      if (user.isLocked) {
        this.logger.warn(
          `User '${user.email}' is already locked`,
          'OrganizationUsersRepository',
        );
        throw new ConflictException('User is already locked');
      }

      user.isLocked = true;
      user.lockedAt = new Date();

      await this.repository.save(user);

      // Log account lock
      this.logger.info(
        `User '${user.email}' account locked`,
        'OrganizationUsersRepository',
        { userId: user.id },
      );
    } catch (error) {
      this.logger.error(
        'Error locking organization user account',
        'OrganizationUsersRepository',
        { error },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to lock organization user account',
        );
      }
    }
  }

  /**
   * Unlocks an organization user's account
   * Access: Organization Admin / System Admin
   * Priority: Low
   */
  async unlockOrganizationUserAccount(
    userId: string,
    unlockedById: string,
  ): Promise<void> {
    try {
      const user = await this.repository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });

      this.validateOrganizationUser(user);

      if (!user.isLocked) {
        this.logger.warn(
          `User '${user.email}' is not locked`,
          'OrganizationUsersRepository',
        );
        throw new ConflictException('User is not locked');
      }

      user.isLocked = false;
      user.lockedAt = null;
      user.updatedBy = unlockedById;
      user.updatedAt = new Date();

      await this.repository.save(user);

      // Log account unlock
      this.logger.info(
        `User '${user.email}' account unlocked by user '${unlockedById}'`,
        'OrganizationUsersRepository',
        { userId: user.id, unlockedById },
      );
    } catch (error) {
      this.logger.error(
        'Error unlocking organization user account',
        'OrganizationUsersRepository',
        { error },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to unlock organization user account',
        );
      }
    }
  }

  /**
   * Finds organization user by ID with optional active status check
   * Access: Organization Admin / Auth Module
   * Priority: High
   */
  async findOrganizationUserById(
    userId: string,
    includeInactive = false,
  ): Promise<OrganizationUser | null> {
    try {
      const whereCondition = includeInactive
        ? { id: userId, deletedAt: IsNull() }
        : { id: userId, isActive: true, deletedAt: IsNull() };

      const user = await this.repository.findOne({
        where: whereCondition,
      });

      return user;
    } catch (error) {
      this.logger.error(
        'Error finding organization user by ID',
        'OrganizationUsersRepository',
        { error },
      );

      throw new InternalServerErrorException(
        'Failed to find organization user by ID',
      );
    }
  }

  /**
   * Finds organization user by email
   * Access: Organization Admin / Auth Module
   * Priority: High
   */
  async findOrganizationUserByEmail(
    organizationId: string,
    email: string,
  ): Promise<OrganizationUser | null> {
    try {
      const user = await this.repository.findOne({
        where: {
          organizationId,
          email,
          deletedAt: IsNull(),
        },
      });

      return user;
    } catch (error) {
      this.logger.error(
        'Error finding organization user by email',
        'OrganizationUsersRepository',
        { error },
      );

      throw new InternalServerErrorException(
        'Failed to find organization user by email',
      );
    }
  }

  /**
   * Lists users within an organization with pagination
   * Access: Organization Admin
   * Priority: Medium
   */
  async listOrganizationUsers(
    organizationId: string,
    options: PaginationOptions<OrganizationUser>,
  ): Promise<PaginationResult<OrganizationUser>> {
    try {
      const { page = 1, limit = 10, sort = [] } = options;
      const userOptions: FindManyOptions<OrganizationUser> =
        options.options || {};

      const skip = (page - 1) * limit;

      const baseWhere: FindOptionsWhere<OrganizationUser> = {
        organizationId,
        deletedAt: IsNull(),
      };

      const where = userOptions.where
        ? { ...userOptions.where, ...baseWhere }
        : baseWhere;

      const order: Record<string, 'ASC' | 'DESC'> = {};

      if (sort.length > 0) {
        sort.forEach(({ field, order: sortOrder }) => {
          order[field] = sortOrder;
        });
      } else {
        order['createdAt'] = 'DESC';
      }

      const [data, total] = await this.repository.findAndCount({
        where,
        order,
        skip,
        take: limit,
        relations: userOptions.relations,
      });

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        'Error listing organization users',
        'OrganizationUsersRepository',
        { error },
      );

      throw new InternalServerErrorException(
        'Failed to list organization users',
      );
    }
  }

  // #endregion

  // #region Query and Search Methods

  /**
   * Searches for users within an organization
   * Access: Organization Admin
   * Priority: Medium
   */
  async searchOrganizationUsers(
    organizationId: string,
    searchTerm: string,
    options: PaginationOptions<OrganizationUser>,
  ): Promise<PaginationResult<OrganizationUser>> {
    try {
      const { page = 1, limit = 10, sort = [] } = options;

      const skip = (page - 1) * limit;

      const queryBuilder = this.repository.createQueryBuilder('user');

      queryBuilder
        .where('user.organizationId = :organizationId', { organizationId })
        .andWhere('user.deletedAt IS NULL')
        .andWhere(
          '(user.firstName ILIKE :searchTerm OR user.lastName ILIKE :searchTerm OR user.email ILIKE :searchTerm OR user.userName ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        );

      const total = await queryBuilder.getCount();

      if (sort.length > 0) {
        sort.forEach(({ field, order: sortOrder }) => {
          queryBuilder.addOrderBy(`user.${field}`, sortOrder);
        });
      } else {
        queryBuilder.addOrderBy('user.createdAt', 'DESC');
      }

      const data = await queryBuilder.skip(skip).take(limit).getMany();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        'Error searching organization users',
        'OrganizationUsersRepository',
        { error },
      );

      throw new InternalServerErrorException(
        'Failed to search organization users',
      );
    }
  }

  // #endregion

  // #region Validation Helper Methods

  /**
   * Checks email uniqueness within organization
   * Access: Private - Internal Use
   */
  private async validateUserEmailUniqueness(
    organizationId: string,
    email: string,
  ): Promise<void> {
    const existingUser = await this.repository.findOne({
      where: {
        organizationId,
        email,
        deletedAt: IsNull(),
      },
    });

    if (existingUser) {
      this.logger.warn(
        `Email '${email}' is already in use within organization '${organizationId}'`,
        'OrganizationUsersRepository',
      );
      throw new ConflictException(
        'Email is already in use within the organization',
      );
    }
  }

  /**
   * Type guard for organization user
   * Access: Private - Internal Use
   */
  private validateOrganizationUser(
    user: OrganizationUser | null,
  ): asserts user is OrganizationUser {
    if (!user) {
      this.logger.warn(
        'Organization user not found',
        'OrganizationUsersRepository',
      );
      throw new NotFoundException('Organization user not found');
    }
  }

  // #endregion
}
