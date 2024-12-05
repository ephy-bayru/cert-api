import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationManagementRepository } from '../repositories/organization-management.repository';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { LoggerService } from '@common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { OrganizationStatus } from '@modules/organizations/entities/organization-status.enum';
import { CreateOrganizationDto } from '@modules/organizations/dtos/create-organization.dto';
import { OrganizationResponseDto } from '@modules/organizations/dtos/organization-response.dto';
import { UpdateOrganizationDto } from '@modules/organizations/dtos/update-organization.dto';
import { AddressDto } from '@modules/users/dtos/address.dto';
import { Address } from '@modules/users/entities/address.entity';

@Injectable()
export class OrganizationManagementService {
  constructor(
    private readonly organizationRepository: OrganizationManagementRepository,
    private readonly logger: LoggerService,
  ) {}

  async createOrganization(
    createOrganizationDto: CreateOrganizationDto,
    createdById: string,
  ): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.organizationRepository.create({
        ...createOrganizationDto,
        createdBy: createdById,
        status: OrganizationStatus.PENDING_APPROVAL,
      });

      this.logger.log(
        'Organization created successfully',
        'OrganizationManagementService',
        {
          organizationId: organization.id,
        },
      );

      return this.toResponseDto(organization);
    } catch (error) {
      this.logger.error(
        'Failed to create organization',
        'OrganizationManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  async updateOrganization(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    updatedById: string,
  ): Promise<OrganizationResponseDto> {
    try {
      // Fetch the existing organization with address
      const organization = await this.organizationRepository.findById(id, {
        relations: ['address'],
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Separate address from the update data
      const { address, ...organizationUpdateData } = updateOrganizationDto;

      // Update organization fields
      Object.assign(organization, organizationUpdateData);
      organization.updatedBy = updatedById;
      organization.updatedAt = new Date();

      // Handle address update
      if (address) {
        if (organization.address) {
          Object.assign(organization.address, address);
        } else {
          organization.address = Object.assign(new Address(), address);
        }
      }

      // Save the updated organization
      await this.organizationRepository.save(organization);

      this.logger.log(
        'Organization updated successfully',
        'OrganizationManagementService',
        {
          organizationId: id,
        },
      );

      return this.toResponseDto(organization);
    } catch (error) {
      this.logger.error(
        'Failed to update organization',
        'OrganizationManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  async findOrganizationById(id: string): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.organizationRepository.findById(id);

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      return this.toResponseDto(organization);
    } catch (error) {
      this.logger.error(
        'Failed to find organization by ID',
        'OrganizationManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  async listOrganizations(
    options: PaginationOptions<Organization>,
    filters?: {
      status?: OrganizationStatus;
      industry?: string;
      search?: string;
    },
  ): Promise<PaginationResult<OrganizationResponseDto>> {
    try {
      const organizations = await this.organizationRepository.getOrganizations(
        options,
        filters,
      );

      this.logger.log(
        'Organizations listed successfully',
        'OrganizationManagementService',
        {
          total: organizations.total,
        },
      );

      const data = organizations.data.map((organization) =>
        this.toResponseDto(organization),
      );

      return { ...organizations, data };
    } catch (error) {
      this.logger.error(
        'Failed to list organizations',
        'OrganizationManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  async approveOrganization(id: string, approvedById: string): Promise<void> {
    try {
      await this.organizationRepository.approveOrganization(id);

      this.logger.log(
        'Organization approved successfully',
        'OrganizationManagementService',
        {
          organizationId: id,
          approvedById,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to approve organization',
        'OrganizationManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  async suspendOrganization(
    id: string,
    reason: string,
    suspendedById: string,
  ): Promise<void> {
    try {
      await this.organizationRepository.suspendOrganization(id, reason);

      this.logger.log(
        'Organization suspended successfully',
        'OrganizationManagementService',
        {
          organizationId: id,
          suspendedById,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to suspend organization',
        'OrganizationManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  async archiveOrganization(id: string, archivedById: string): Promise<void> {
    try {
      await this.organizationRepository.archiveOrganization(id);

      this.logger.log(
        'Organization archived successfully',
        'OrganizationManagementService',
        {
          organizationId: id,
          archivedById,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to archive organization',
        'OrganizationManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  private toResponseDto(organization: Organization): OrganizationResponseDto {
    const {
      id,
      name,
      contactEmail,
      contactPhoneNumber,
      industry,
      foundedDate,
      description,
      website,
      logoUrl,
      status,
      verifiedAt,
      address,
      complianceInfo,
      blockchainMetadata,
      createdAt,
      updatedAt,
      metadata,
    } = organization;

    const organizationResponse = new OrganizationResponseDto({
      id,
      name,
      contactEmail,
      contactPhoneNumber,
      industry,
      foundedDate,
      description,
      website,
      logoUrl,
      status,
      verifiedAt,
      address: address ? new AddressDto() : undefined,
      complianceInfo,
      blockchainMetadata,
      createdAt,
      updatedAt,
      metadata,
    });

    return organizationResponse;
  }
}
