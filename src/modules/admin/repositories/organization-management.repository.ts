// organization-management.repository.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull, ILike, Not, FindOneOptions } from 'typeorm';
import { BaseRepository } from '@core/repository/base.repository';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { LoggerService } from '@common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { OrganizationStatus } from '@modules/organizations/entities/organization-status.enum';

@Injectable()
export class OrganizationManagementRepository extends BaseRepository<Organization> {
  constructor(
    dataSource: DataSource,
    protected readonly logger: LoggerService,
  ) {
    super(dataSource, Organization, logger);
  }

  /**
   * Retrieves an organization by ID.
   */
  async findById(
    id: string,
    options?: FindOneOptions<Organization>,
  ): Promise<Organization | null> {
    try {
      return await this.repository.findOne({
        where: { id, deletedAt: IsNull() },
        ...options,
      });
    } catch (error) {
      this.handleError('Error finding organization by ID', error, { id });
    }
  }

  /**
   * Retrieves organizations with pagination and optional filters.
   */
  async getOrganizations(
    paginationOptions: PaginationOptions<Organization>,
    filters?: {
      status?: OrganizationStatus;
      industry?: string;
      search?: string;
    },
  ): Promise<PaginationResult<Organization>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('organization');
      queryBuilder.where('organization.deletedAt IS NULL');

      if (filters?.status) {
        queryBuilder.andWhere('organization.status = :status', {
          status: filters.status,
        });
      }

      if (filters?.industry) {
        queryBuilder.andWhere('organization.industry = :industry', {
          industry: filters.industry,
        });
      }

      if (filters?.search) {
        const search = `%${filters.search}%`;
        queryBuilder.andWhere('organization.name ILIKE :search', { search });
      }

      // Apply pagination
      const { page = 1, limit = 10, sort = [] } = paginationOptions;
      queryBuilder.skip((page - 1) * limit);
      queryBuilder.take(limit);

      // Apply sorting if provided
      if (sort && sort.length > 0) {
        sort.forEach(({ field, order }) => {
          queryBuilder.addOrderBy(`organization.${field}`, order);
        });
      } else {
        queryBuilder.addOrderBy('organization.createdAt', 'DESC');
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.handleError('Error retrieving organizations', error, {
        paginationOptions,
        filters,
      });
    }
  }

  /**
   * Approves (activates) an organization.
   */
  async approveOrganization(id: string): Promise<void> {
    try {
      await this.update(id, { status: OrganizationStatus.ACTIVE });
    } catch (error) {
      this.handleError('Error approving organization', error, { id });
    }
  }

  /**
   * Suspends an organization.
   */
  async suspendOrganization(id: string, reason: string): Promise<void> {
    try {
      const organization = await this.findOne({ where: { id } });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      organization.status = OrganizationStatus.SUSPENDED;
      organization.metadata = {
        ...organization.metadata,
        suspensionReason: reason,
      };

      await this.save(organization);
    } catch (error) {
      this.handleError('Error suspending organization', error, { id, reason });
    }
  }

  /**
   * Archives an organization.
   */
  async archiveOrganization(id: string): Promise<void> {
    try {
      await this.update(id, { status: OrganizationStatus.ARCHIVED });
    } catch (error) {
      this.handleError('Error archiving organization', error, { id });
    }
  }

  /**
   * Deletes an organization (soft delete).
   */
  async deleteOrganization(id: string): Promise<void> {
    try {
      await this.update(id, { deletedAt: new Date() });
    } catch (error) {
      this.handleError('Error deleting organization', error, { id });
    }
  }

  /**
   * Updates an organization's details.
   */
  async updateOrganization(
    id: string,
    updateData: Partial<Organization>,
  ): Promise<Organization> {
    try {
      await this.update(id, updateData);
      const updatedOrganization = await this.findById(id);
      if (!updatedOrganization) {
        throw new NotFoundException('Organization not found after update');
      }
      return updatedOrganization;
    } catch (error) {
      this.handleError('Error updating organization', error, {
        id,
        updateData,
      });
    }
  }
}
