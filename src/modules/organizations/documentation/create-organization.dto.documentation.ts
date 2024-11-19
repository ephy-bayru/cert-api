import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrganizationResponseDto } from '../dtos/organization-response.dto';
import {
  CreateOrganizationDto,
  CreateOrganizationWithAdminDto,
} from '../dtos/create-organization.dto';

export function CreateOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new organization',
      description: `
        Creates a new organization in the system.

        **Access:** Requires Admin privileges.

        **Notes:**
        - Organization name must be unique.
        - At least one contact method (email or phone) is required.
        - The organization will be created with a status of \`PENDING_APPROVAL\` by default.
      `,
    }),
    // Optionally, include an authentication decorator
    // @ApiBearerAuth()
    ApiBody({
      type: CreateOrganizationDto,
      required: true,
      description: 'Organization creation payload',
      examples: {
        basic: {
          summary: 'Basic Organization',
          description: 'Minimum required fields for organization creation',
          value: {
            name: 'Acme Corp',
          },
        },
        withOptionalFields: {
          summary: 'Organization with Optional Fields',
          description: 'Organization creation with optional fields included',
          value: {
            name: 'Acme Corp',
            contactEmail: 'contact@acme.com',
            contactPhoneNumber: '+1234567890',
            industry: 'Technology',
            foundedDate: '2020-01-01',
            description: 'Leading technology solutions provider',
            website: 'https://www.acme.com',
            logoUrl: 'https://www.acme.com/logo.png',
            // Exclude 'status' if it's not supposed to be set by the client
            // status: 'PENDING_APPROVAL',
            settings: {
              requireTwoFactorAuth: true,
              allowExternalVerifiers: false,
              documentRetentionDays: 365,
              autoArchiveEnabled: true,
            },
            blockchainAddress: '0x1234567890abcdef1234567890abcdef12345678',
            address: {
              streetAddress: '123 Tech Street',
              city: 'San Francisco',
              state: 'CA',
              country: 'USA',
              postalCode: '94105',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Organization created successfully.',
      type: OrganizationResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid organization data.',
      content: {
        'application/json': {
          schema: {
            example: {
              statusCode: 400,
              message: [
                'name must be longer than 2 characters',
                'contactEmail must be a valid email',
                'blockchainAddress must match /^0x[a-fA-F0-9]{40}$/',
              ],
              error: 'Bad Request',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions to create organization.',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Organization with this name already exists.',
      schema: {
        example: {
          statusCode: 409,
          message: 'Organization with this name already exists',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function CreateOrganizationWithAdminDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new organization with an admin user',
      description: `
        Creates a new organization and its initial admin user in a single operation.

        **Access:** Requires Super Admin privileges.

        **Notes:**
        - Both organization and admin user accounts are created.
        - The admin user will receive an email verification link.
        - The admin password must meet the security requirements.
      `,
    }),
    // Optionally, include an authentication decorator
    // @ApiBearerAuth()
    ApiBody({
      type: CreateOrganizationWithAdminDto,
      required: true,
      description: 'Organization and admin user creation payload',
      examples: {
        basic: {
          summary: 'Basic Organization with Admin',
          description:
            'Create an organization with minimal required fields and an admin user',
          value: {
            name: 'Acme Corp',
            adminEmail: 'admin@acme.com',
            adminPassword: 'StrongP@ssw0rd123!',
          },
        },
        complete: {
          summary: 'Complete Organization with Admin',
          description:
            'Full organization setup with all optional fields and an admin user',
          value: {
            name: 'Acme Corporation',
            contactEmail: 'contact@acme.com',
            contactPhoneNumber: '+1234567890',
            industry: 'Technology',
            foundedDate: '2020-01-01',
            description: 'Leading technology solutions provider',
            website: 'https://www.acme.com',
            logoUrl: 'https://www.acme.com/logo.png',
            settings: {
              requireTwoFactorAuth: true,
              allowExternalVerifiers: false,
              documentRetentionDays: 365,
              autoArchiveEnabled: true,
            },
            address: {
              streetAddress: '123 Tech Street',
              city: 'San Francisco',
              state: 'CA',
              country: 'USA',
              postalCode: '94105',
            },
            adminEmail: 'admin@acme.com',
            adminPassword: 'StrongP@ssw0rd123!',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Organization and admin user created successfully.',
      type: OrganizationResponseDto, // Or a custom DTO if it includes admin user info
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid data provided.',
      content: {
        'application/json': {
          schema: {
            example: {
              statusCode: 400,
              message: [
                'adminEmail must be a valid email',
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
              ],
              error: 'Bad Request',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description:
        'Insufficient permissions to create organization with admin user.',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Organization or admin user already exists.',
      schema: {
        example: {
          statusCode: 409,
          message: 'Organization with this name already exists',
          error: 'Conflict',
        },
      },
    }),
  );
}
