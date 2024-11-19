import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  DataSource,
  QueryRunner,
  FindOptionsWhere,
  IsNull,
  Not,
  FindManyOptions,
} from 'typeorm';
import { BaseRepository } from '@core/repository/base.repository';
import { LoggerService } from '@common/services/logger.service';
import { Organization } from '../entities/organization.entity';
import { OrganizationUser } from '../entities/organization-user.entity';
import { OrganizationStatus } from '../entities/organization-status.enum';
import { OrganizationUserRole } from '../entities/organization-user-role.enum';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import {
  PaginationOptions,
  PaginationResult,
  SortOption,
} from '@common/interfaces/IPagination';
import * as bcrypt from 'bcrypt';
import { Address } from '@modules/users/entities/address.entity';

@Injectable()
export class OrganizationsRepository extends BaseRepository<Organization> {
  constructor(
    dataSource: DataSource,
    protected readonly logger: LoggerService,
  ) {
    super(dataSource, Organization, logger);
  }

  // #region Core Organization Management Methods

  /**
   * Creates a new organization with an initial admin user
   * Access: Public - System Admin
   * Priority: High
   */
  async createOrganizationWithAdmin(
    createOrganizationDto: CreateOrganizationDto,
    adminEmail: string,
    adminPassword: string,
    createdById: string,
  ): Promise<Organization> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { name } = createOrganizationDto;

      // Validate uniqueness
      await this.validateOrganizationUniqueness(queryRunner, name, adminEmail);

      // Create organization entity
      const organization = queryRunner.manager.create(Organization, {
        ...createOrganizationDto,
        status: OrganizationStatus.PENDING_APPROVAL,
        createdBy: createdById,
      });

      // Save organization
      await queryRunner.manager.save(Organization, organization);

      // Create initial admin user
      await this.createInitialAdminUser(queryRunner, {
        organizationId: organization.id,
        email: adminEmail,
        password: adminPassword,
        createdById,
      });

      // Commit transaction
      await queryRunner.commitTransaction();

      // Log success
      this.logger.info(
        `Organization '${organization.name}' created with initial admin '${adminEmail}'`,
        'OrganizationsRepository',
        { organizationId: organization.id, createdById },
      );

      return organization;
    } catch (error) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();

      // Log error
      this.logger.error(
        'Error creating organization with admin',
        'OrganizationsRepository',
        { error, adminEmail, createdById },
      );

      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to create organization');
      }
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Activates a pending organization and its admin users
   * Access: Restricted - System Admin Only
   * Priority: High
   */
  async activateOrganization(
    organizationId: string,
    activatedById: string,
    reason?: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the organization
      const organization = await queryRunner.manager.findOne(Organization, {
        where: { id: organizationId, deletedAt: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });

      if (!organization) {
        this.logger.warn(
          `Organization with ID '${organizationId}' not found`,
          'OrganizationsRepository',
        );
        throw new NotFoundException('Organization not found');
      }

      // Check if organization is in a pending status
      if (
        organization.status !== OrganizationStatus.PENDING_APPROVAL &&
        organization.status !== OrganizationStatus.PENDING_VERIFICATION
      ) {
        this.logger.warn(
          `Organization '${organization.name}' is not in a pending status`,
          'OrganizationsRepository',
          { status: organization.status },
        );
        throw new ConflictException(
          'Organization is not in a pending status and cannot be activated',
        );
      }

      // Update the organization's status to ACTIVE
      organization.status = OrganizationStatus.ACTIVE;
      organization.verifiedAt = new Date();
      organization.verifiedBy = activatedById;
      organization.updatedBy = activatedById;
      organization.updatedAt = new Date();

      // Optionally, add activation reason to metadata
      if (reason) {
        organization.metadata = {
          ...organization.metadata,
          activationReason: reason,
        };
      }

      await queryRunner.manager.save(Organization, organization);

      // Activate all users in the organization
      await queryRunner.manager.update(
        OrganizationUser,
        { organizationId: organization.id },
        {
          isActive: true,
          updatedBy: activatedById,
          updatedAt: new Date(),
        },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      // Log success
      this.logger.info(
        `Organization '${organization.name}' activated`,
        'OrganizationsRepository',
        { organizationId: organization.id, activatedById },
      );
    } catch (error) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();

      // Log error
      this.logger.error(
        'Error activating organization',
        'OrganizationsRepository',
        { error, organizationId, activatedById },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to activate organization',
        );
      }
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Suspends an active organization and deactivates all its users
   * Access: Restricted - System Admin Only
   * Priority: High
   */
  async suspendOrganization(
    organizationId: string,
    suspendedById: string,
    reason: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the organization
      const organization = await queryRunner.manager.findOne(Organization, {
        where: { id: organizationId, deletedAt: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });

      if (!organization) {
        this.logger.warn(
          `Organization with ID '${organizationId}' not found`,
          'OrganizationsRepository',
        );
        throw new NotFoundException('Organization not found');
      }

      // Check if organization is active
      if (organization.status !== OrganizationStatus.ACTIVE) {
        this.logger.warn(
          `Organization '${organization.name}' is not active`,
          'OrganizationsRepository',
          { status: organization.status },
        );
        throw new ConflictException(
          'Only active organizations can be suspended',
        );
      }

      // Update the organization's status to SUSPENDED
      organization.status = OrganizationStatus.SUSPENDED;
      organization.updatedBy = suspendedById;
      organization.updatedAt = new Date();
      organization.metadata = {
        ...organization.metadata,
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedBy: suspendedById,
      };

      await queryRunner.manager.save(Organization, organization);

      // Deactivate all users in the organization
      await queryRunner.manager.update(
        OrganizationUser,
        { organizationId: organization.id },
        {
          isActive: false,
          updatedBy: suspendedById,
          updatedAt: new Date(),
          deactivatedAt: new Date(),
          deactivatedBy: suspendedById,
          deactivationReason: reason,
        },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      // Log success
      this.logger.info(
        `Organization '${organization.name}' suspended`,
        'OrganizationsRepository',
        { organizationId: organization.id, suspendedById, reason },
      );
    } catch (error) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();

      // Log error
      this.logger.error(
        'Error suspending organization',
        'OrganizationsRepository',
        { error, organizationId, suspendedById },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to suspend organization',
        );
      }
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Archives an organization, setting its status to ARCHIVED
   * Access: Restricted - System Admin Only
   * Priority: High
   */
  async archiveOrganization(
    organizationId: string,
    archivedById: string,
    reason: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Retrieve the organization
      const organization = await queryRunner.manager.findOne(Organization, {
        where: { id: organizationId, deletedAt: IsNull() },
      });

      if (!organization) {
        this.logger.warn(
          `Organization with ID '${organizationId}' not found for archiving`,
          'OrganizationsRepository',
        );
        throw new NotFoundException('Organization not found');
      }

      // Check if the organization is already archived
      if (organization.status === OrganizationStatus.ARCHIVED) {
        this.logger.warn(
          `Organization '${organization.name}' is already archived`,
          'OrganizationsRepository',
        );
        throw new ConflictException('Organization is already archived');
      }

      // Update organization status to ARCHIVED
      organization.status = OrganizationStatus.ARCHIVED;
      organization.updatedBy = archivedById;
      organization.updatedAt = new Date();
      organization.metadata = {
        ...organization.metadata,
        archivedBy: archivedById,
        archivedAt: new Date(),
        archiveReason: reason,
      };

      await queryRunner.manager.save(Organization, organization);

      // Deactivate all organization users
      await queryRunner.manager.update(
        OrganizationUser,
        { organizationId },
        {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: archivedById,
          deactivationReason: 'Organization archived',
        },
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      // Log success
      this.logger.info(
        `Organization '${organization.name}' archived by user '${archivedById}'`,
        'OrganizationsRepository',
        { organizationId, archivedById, reason },
      );
    } catch (error) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();

      // Log error
      this.logger.error(
        'Error archiving organization',
        'OrganizationsRepository',
        { error, organizationId, archivedById },
      );

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to archive organization',
        );
      }
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Updates organization details
   * Access: Organization Admin / System Admin
   * Priority: High
   */
  async updateOrganization(
    organizationId: string,
    updateOrganizationDto: UpdateOrganizationDto,
    updatedById: string,
  ): Promise<Organization> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Retrieve the existing organization, including its address
      const existingOrganization = await queryRunner.manager.findOne(
        Organization,
        {
          where: { id: organizationId, deletedAt: IsNull() },
          relations: ['address'],
        },
      );

      if (!existingOrganization) {
        this.logger.warn(
          `Organization with ID '${organizationId}' not found for updating`,
          'OrganizationsRepository',
        );
        throw new NotFoundException('Organization not found');
      }

      // Validate uniqueness if name or contact email is being updated
      await this.validateOrganizationUpdateUniqueness(
        queryRunner,
        organizationId,
        updateOrganizationDto,
      );

      // Separate address from the rest of the DTO
      const { address, ...organizationUpdates } = updateOrganizationDto;

      // Prepare the update data without the address
      const updateData: Partial<Organization> = {
        ...organizationUpdates,
        updatedBy: updatedById,
        updatedAt: new Date(),
      };

      // Update the organization
      await queryRunner.manager.update(
        Organization,
        { id: organizationId },
        updateData,
      );

      // Handle address update separately
      if (address) {
        if (existingOrganization.address) {
          // Update existing address
          await queryRunner.manager.update(
            Address,
            { id: existingOrganization.address.id },
            address,
          );
        } else {
          // Create new address
          const newAddress = queryRunner.manager.create(Address, address);
          await queryRunner.manager.save(newAddress);

          // Associate the new address with the organization
          existingOrganization.address = newAddress;
          await queryRunner.manager.save(existingOrganization);
        }
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Log success
      this.logger.info(
        `Organization '${existingOrganization.name}' updated by user '${updatedById}'`,
        'OrganizationsRepository',
        { organizationId, updatedById },
      );

      // Retrieve the updated organization with relations
      const updatedOrganization = await this.findOne({
        where: { id: organizationId },
        relations: ['address'],
      });

      return updatedOrganization;
    } catch (error) {
      // Rollback transaction
      await queryRunner.rollbackTransaction();

      // Log error
      this.logger.error(
        'Error updating organization',
        'OrganizationsRepository',
        { error, organizationId, updatedById },
      );

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to update organization');
      }
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Retrieves organization details by ID
   * Access: Organization Users / System Admin
   * Priority: High
   */
  async findOrganizationById(
    organizationId: string,
    options?: { relations?: string[] },
  ): Promise<Organization> {
    try {
      const { relations = [] } = options || {};

      const organization = await this.repository.findOne({
        where: { id: organizationId, deletedAt: IsNull() },
        relations,
      });

      if (!organization) {
        this.logger.warn(
          `Organization with ID '${organizationId}' not found`,
          'OrganizationsRepository',
        );
        throw new NotFoundException('Organization not found');
      }

      return organization;
    } catch (error) {
      this.logger.error(
        `Error retrieving organization by ID '${organizationId}'`,
        'OrganizationsRepository',
        { error },
      );
      throw new InternalServerErrorException('Failed to retrieve organization');
    }
  }

  /**
   * Lists organizations with pagination and optional filters
   * Access: System Admin
   * Priority: High
   */
  async listOrganizations(
    options: PaginationOptions<Organization>,
  ): Promise<PaginationResult<Organization>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = [],
        options: findOptions = {} as FindManyOptions<Organization>,
      } = options;

      const skip = (page - 1) * limit;

      // Ensure deletedAt is always null (exclude soft-deleted records)
      const baseWhere: FindOptionsWhere<Organization> = { deletedAt: IsNull() };

      // Merge provided where conditions, ensuring deletedAt is IsNull()
      let where: FindOptionsWhere<Organization>;
      if (findOptions.where) {
        // Prevent overriding the deletedAt condition
        if ('deletedAt' in findOptions.where) {
          this.logger.warn(
            `Ignoring 'deletedAt' condition in findOptions.where`,
            'OrganizationsRepository',
          );
          delete findOptions.where.deletedAt;
        }
        where = { ...findOptions.where, ...baseWhere };
      } else {
        where = baseWhere;
      }

      // Build order object for sorting
      let order: Record<string, 'ASC' | 'DESC'> = {};

      if (sort.length > 0) {
        const validFields = this.repository.metadata.columns.map(
          (column) => column.propertyName,
        );

        sort.forEach((sortOption: SortOption<Organization>) => {
          const { field, order: sortOrder } = sortOption;

          if (validFields.includes(field)) {
            order[field] = sortOrder;
          } else {
            this.logger.warn(
              `Invalid sort field '${field}' in listOrganizations`,
              'OrganizationsRepository',
            );
          }
        });
      }

      // Default sorting if no valid sort options provided
      if (Object.keys(order).length === 0) {
        order = { createdAt: 'DESC' };
      }

      // Prepare final find options
      const finalFindOptions: FindManyOptions<Organization> = {
        ...findOptions,
        where,
        order,
        skip,
        take: limit,
      };

      // Execute find and count
      const [organizations, total] =
        await this.repository.findAndCount(finalFindOptions);

      return {
        data: organizations,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        'Error listing organizations',
        'OrganizationsRepository',
        { error },
      );
      throw new InternalServerErrorException('Failed to list organizations');
    }
  }

  /**
   * Finds an organization by its name
   * Access: Public
   * Priority: Medium
   */
  async findByName(name: string): Promise<Organization | null> {
    try {
      const organization = await this.repository.findOne({
        where: { name, deletedAt: IsNull() },
      });

      return organization;
    } catch (error) {
      this.logger.error(
        `Error finding organization by name '${name}'`,
        'OrganizationsRepository',
        { error },
      );
      throw new InternalServerErrorException(
        'Failed to find organization by name',
      );
    }
  }

  // #endregion

  // #region Validation Helper Methods

  /**
   * Validates organization and admin email uniqueness constraints
   * Access: Private - Internal Use
   */
  private async validateOrganizationUniqueness(
    queryRunner: QueryRunner,
    name: string,
    adminEmail: string,
  ): Promise<void> {
    const organizationRepo = queryRunner.manager.getRepository(Organization);
    const orgUserRepo = queryRunner.manager.getRepository(OrganizationUser);

    const [existingOrg, existingUser] = await Promise.all([
      organizationRepo.findOne({
        where: { name, deletedAt: IsNull() },
      }),
      orgUserRepo.findOne({
        where: { email: adminEmail, deletedAt: IsNull() },
      }),
    ]);

    if (existingOrg) {
      this.logger.warn(
        `Organization with name '${name}' already exists`,
        'OrganizationsRepository',
        { name },
      );
      throw new ConflictException(
        `Organization with name '${name}' already exists`,
      );
    }

    if (existingUser) {
      this.logger.warn(
        `User with email '${adminEmail}' already exists`,
        'OrganizationsRepository',
        { adminEmail },
      );
      throw new ConflictException(
        `User with email '${adminEmail}' already exists`,
      );
    }
  }

  /**
   * Validates organization status for operations
   * Access: Private - Internal Use
   */
  private async validateOrganizationStatus(
    organizationId: string,
  ): Promise<Organization> {
    const organization = await this.repository.findOne({
      where: { id: organizationId, deletedAt: IsNull() },
    });

    if (!organization) {
      this.logger.warn(
        `Organization with ID '${organizationId}' not found`,
        'OrganizationsRepository',
      );
      throw new NotFoundException('Organization not found');
    }

    if (organization.status !== OrganizationStatus.ACTIVE) {
      this.logger.warn(
        `Organization '${organization.name}' is not active`,
        'OrganizationsRepository',
        { status: organization.status },
      );
      throw new ConflictException(
        'Organization is not in a valid status for this operation',
      );
    }

    return organization;
  }

  /**
   * Validates uniqueness constraints during organization update
   * Access: Private - Internal Use
   */
  private async validateOrganizationUpdateUniqueness(
    queryRunner: QueryRunner,
    organizationId: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<void> {
    const { name, contactEmail } = updateOrganizationDto;
    const organizationRepo = queryRunner.manager.getRepository(Organization);

    // Check if name is being updated and is unique
    if (name) {
      const existingOrg = await organizationRepo.findOne({
        where: {
          name,
          id: Not(organizationId),
          deletedAt: IsNull(),
        },
      });
      if (existingOrg) {
        this.logger.warn(
          `Organization name '${name}' is already in use`,
          'OrganizationsRepository',
          { name },
        );
        throw new ConflictException(
          `Organization name '${name}' is already in use`,
        );
      }
    }

    // Check if contactEmail is being updated and is unique
    if (contactEmail) {
      const existingOrg = await organizationRepo.findOne({
        where: {
          contactEmail,
          id: Not(organizationId),
          deletedAt: IsNull(),
        },
      });
      if (existingOrg) {
        this.logger.warn(
          `Contact email '${contactEmail}' is already in use`,
          'OrganizationsRepository',
          { contactEmail },
        );
        throw new ConflictException(
          `Contact email '${contactEmail}' is already in use`,
        );
      }
    }
  }

  // #endregion

  // #region Utility Methods

  /**
   * Creates initial admin user for new organization
   * Access: Private - Internal Use
   */
  private async createInitialAdminUser(
    queryRunner: QueryRunner,
    params: {
      organizationId: string;
      email: string;
      password: string;
      createdById: string;
    },
  ): Promise<OrganizationUser> {
    const { organizationId, email, password, createdById } = params;

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user entity
    const adminUser = queryRunner.manager.create(OrganizationUser, {
      organizationId,
      email,
      password: hashedPassword,
      role: OrganizationUserRole.SUPER_ADMIN,
      isActive: true,
      isEmailVerified: false,
      createdBy: createdById,
    });

    // Save admin user
    await queryRunner.manager.save(OrganizationUser, adminUser);

    // Log admin user creation
    this.logger.info(
      `Admin user '${email}' created for organization '${organizationId}'`,
      'OrganizationsRepository',
      { userId: adminUser.id, organizationId },
    );

    return adminUser;
  }

  // #endregion
}
