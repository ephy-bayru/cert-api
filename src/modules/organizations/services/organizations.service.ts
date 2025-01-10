import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { Organization } from '../entities/organization.entity';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { LoggerService } from '@common/services/logger.service';
import { OrganizationsRepository } from '../repository/organizations.repository';
import { CreateOrganizationWithAdminDto } from '../dtos/create-organization-with-admin.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly logger: LoggerService,
  ) {}

  async createOrganizationWithAdmin(
    createOrganizationWithAdminDto: CreateOrganizationWithAdminDto,
    createdById: string,
  ): Promise<Organization> {
    this.logger.log(
      `Initiating creation of organization '${createOrganizationWithAdminDto.name}' by user ID: ${createdById}`,
    );

    try {
      const organization =
        await this.organizationsRepository.createOrganizationWithAdmin(
          createOrganizationWithAdminDto,
          createdById,
        );

      this.logger.log(
        `Organization '${organization.name}' created successfully with ID: ${organization.id}`,
      );

      return organization;
    } catch (error) {
      this.logger.error(
        `Failed to create organization '${createOrganizationWithAdminDto.name}'`,
        error.stack,
      );
      throw error;
    }
  }

  async activateOrganization(
    organizationId: string,
    activatedById: string,
    reason?: string,
  ): Promise<{
    statusCode: number;
    message: string;
    data: any;
    timestamp: string;
  }> {
    try {
      await this.organizationsRepository.activateOrganization(
        organizationId,
        activatedById,
        reason,
      );
      this.logger.info(
        'Organization activated successfully',
        'OrganizationService',
        {
          organizationId,
        },
      );
      return {
        statusCode: 200,
        message: 'Organization activated successfully',
        data: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        'Failed to activate organization',
        'OrganizationService',
        {
          error,
          organizationId,
        },
      );
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to activate organization');
    }
  }

  async suspendOrganization(
    organizationId: string,
    suspendedById: string,
    reason: string,
  ): Promise<{
    statusCode: number;
    message: string;
    data: any;
    timestamp: string;
  }> {
    try {
      await this.organizationsRepository.suspendOrganization(
        organizationId,
        suspendedById,
        reason,
      );
      this.logger.info(
        'Organization suspended successfully',
        'OrganizationService',
        { organizationId },
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Organization suspended successfully',
        data: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        'Failed to suspend organization',
        'OrganizationService',
        { error, organizationId },
      );
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to suspend organization');
    }
  }

  async archiveOrganization(
    organizationId: string,
    archivedById: string,
    reason: string,
  ): Promise<{
    statusCode: number;
    message: string;
    data: any;
    timestamp: string;
  }> {
    try {
      await this.organizationsRepository.archiveOrganization(
        organizationId,
        archivedById,
        reason,
      );
      this.logger.info(
        'Organization archived successfully',
        'OrganizationService',
        { organizationId },
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Organization archived successfully',
        data: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        'Failed to archive organization',
        'OrganizationService',
        { error, organizationId },
      );
      throw new InternalServerErrorException('Failed to archive organization');
    }
  }

  async updateOrganization(
    organizationId: string,
    updateOrganizationDto: UpdateOrganizationDto,
    updatedById: string,
  ): Promise<Organization> {
    try {
      const updatedOrganization =
        await this.organizationsRepository.updateOrganization(
          organizationId,
          updateOrganizationDto,
          updatedById,
        );
      this.logger.info(
        'Organization updated successfully',
        'OrganizationService',
        {
          organizationId,
        },
      );
      return updatedOrganization;
    } catch (error) {
      this.logger.error(
        'Failed to update organization',
        'OrganizationService',
        {
          error,
          organizationId,
        },
      );
      throw error;
    }
  }

  async findOrganizationById(
    organizationId: string,
    options?: { relations?: string[] },
  ): Promise<Organization> {
    try {
      const organization =
        await this.organizationsRepository.findOrganizationById(
          organizationId,
          options,
        );
      this.logger.info(
        'Organization retrieved successfully',
        'OrganizationService',
        {
          organizationId,
        },
      );
      return organization;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve organization',
        'OrganizationService',
        {
          error,
          organizationId,
        },
      );
      throw error;
    }
  }

  async listOrganizations(
    paginationOptions: PaginationOptions<Organization>,
  ): Promise<PaginationResult<Organization>> {
    try {
      const organizations =
        await this.organizationsRepository.listOrganizations(paginationOptions);
      this.logger.info(
        'Organizations listed successfully',
        'OrganizationService',
        {
          total: organizations.total,
        },
      );
      return organizations;
    } catch (error) {
      this.logger.error('Failed to list organizations', 'OrganizationService', {
        error,
      });
      throw error;
    }
  }

  async findByName(name: string): Promise<Organization> {
    try {
      const organization = await this.organizationsRepository.findByName(name);
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
      this.logger.info('Organization found by name', 'OrganizationService', {
        name,
      });
      return organization;
    } catch (error) {
      this.logger.error(
        'Failed to find organization by name',
        'OrganizationService',
        {
          error,
          name,
        },
      );
      throw error;
    }
  }
}
