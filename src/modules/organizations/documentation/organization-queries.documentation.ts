import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { OrganizationResponseDto } from '../dtos/organization-response.dto';
import { OrganizationStatus } from '../entities/organization-status.enum';

export function GetOrganizationByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get organization by ID',
      description: `
        Retrieves detailed information about a specific organization.
        - Accessible by system admins and organization members
        - Returns comprehensive organization details
        - Includes relationships and metadata
        - Sensitive data is automatically filtered based on user role
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization unique identifier',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Organization details retrieved successfully',
      type: OrganizationResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions to view organization',
      schema: {
        example: {
          statusCode: 403,
          message: 'You do not have permission to view this organization',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Organization not found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Organization not found',
          error: 'Not Found',
        },
      },
    }),
  );
}

export function ListOrganizationsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organizations',
      description: `
        Retrieves a paginated list of organizations with optional filters.
        - Supports pagination and sorting
        - Filterable by status, industry, and other criteria
        - Results are sorted by creation date by default
        - Access controlled based on user role
      `,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (1-based)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
      example: 10,
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: OrganizationStatus,
      description: 'Filter by organization status',
    }),
    ApiQuery({
      name: 'industry',
      required: false,
      type: String,
      description: 'Filter by industry sector',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search term for organization name or description',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by',
      enum: ['name', 'createdAt', 'status', 'industry'],
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      type: String,
      enum: ['ASC', 'DESC'],
      description: 'Sort order',
    }),
    ApiResponse({
      status: 200,
      description: 'Organizations retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrganizationResponseDto' },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' },
            },
          },
        },
        example: {
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Acme Corp',
              status: 'ACTIVE',
              industry: 'Technology',
              createdAt: '2024-01-01T00:00:00.000Z',
              // ... other organization fields
            },
            // ... more organizations
          ],
          meta: {
            total: 100,
            page: 1,
            limit: 10,
            totalPages: 10,
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
  );
}

export function FindOrganizationByNameDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find organization by name',
      description: `
        Searches for an organization by its exact name.
        - Case-insensitive search
        - Returns single best match
        - Public endpoint with limited data exposure
      `,
    }),
    ApiParam({
      name: 'name',
      type: 'string',
      description: 'Organization name to search for',
      example: 'Acme Corp',
    }),
    ApiResponse({
      status: 200,
      description: 'Organization found',
      type: OrganizationResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Organization not found',
    }),
  );
}

export function SearchOrganizationsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search organizations',
      description: `
        Performs a full-text search across organizations.
        - Searches across name, description, and industry
        - Supports partial matching
        - Returns paginated results
        - Results ordered by relevance
      `,
    }),
    ApiQuery({
      name: 'q',
      required: true,
      type: String,
      description: 'Search query',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Results per page',
    }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: 'object',
      description: 'Additional filters',
    }),
    ApiResponse({
      status: 200,
      description: 'Search results',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrganizationResponseDto' },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      },
    }),
  );
}

export function GetOrganizationStatsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get organization statistics',
      description: `
        Retrieves statistical information about the organization.
        - Includes member counts and activity metrics
        - Provides verification statistics
        - Shows document processing metrics
        - Available to organization admins and system admins
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Statistics retrieved successfully',
      schema: {
        example: {
          memberStats: {
            total: 150,
            active: 142,
            admins: 5,
            verifiers: 20,
          },
          documentStats: {
            total: 1000,
            verified: 850,
            pending: 100,
            rejected: 50,
          },
          verificationStats: {
            totalProcessed: 900,
            averageProcessingTime: '2.5 days',
            successRate: '94.4%',
          },
          activityMetrics: {
            dailyActiveUsers: 75,
            monthlyActiveUsers: 130,
            peakConcurrentUsers: 45,
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'Organization not found',
    }),
  );
}
