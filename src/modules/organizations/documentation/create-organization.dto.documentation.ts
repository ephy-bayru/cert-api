import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrganizationResponseDto } from '../dtos/organization-response.dto';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { CreateOrganizationWithAdminDto } from '../dtos/create-organization-with-admin.dto';

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
      summary: 'Create a new organization with a SUPER_ADMIN user',
      description: `
        Creates a new organization along with an initial SUPER_ADMIN user.

        **Access:** Requires Super Admin privileges.

        **Notes:**
        - Both organization and SUPER_ADMIN user accounts are created.
        - The SUPER_ADMIN user will receive an email verification link.
        - The admin password must meet the security requirements.
        - The SUPER_ADMIN has full access and can manage all aspects of the organization.
      `,
    }),
    // Optionally, include an authentication decorator
    // @ApiBearerAuth()
    ApiBody({
      type: CreateOrganizationWithAdminDto,
      required: true,
      description: 'Organization and SUPER_ADMIN user creation payload',
      examples: {
        basic: {
          summary: 'Basic Organization with SUPER_ADMIN',
          description:
            'Create an organization with minimal required fields and a SUPER_ADMIN user',
          value: {
            name: 'Acme Corp',
            adminEmail: 'admin@acme.com',
            adminPassword: 'StrongP@ssw0rd123!',
          },
        },
        complete: {
          summary: 'Complete Organization with SUPER_ADMIN',
          description:
            'Full organization setup with all optional fields and a SUPER_ADMIN user',
          value: {
            name: 'Acme Corporation',
            contactEmail: 'contact@acme.com',
            contactPhoneNumber: '+1234567890',
            industry: 'Technology',
            foundedDate: '2020-01-01T00:00:00.000Z',
            description: 'Leading technology solutions provider',
            website: 'https://www.acme.com',
            logoUrl: 'https://www.acme.com/logo.png',
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
            metadata: {
              additionalNotes: 'This is a test organization',
              region: 'North America',
            },
            adminEmail: 'admin@acme.com',
            adminPassword: 'StrongP@ssw0rd123!',
            adminFirstName: 'Alice',
            adminLastName: 'Smith',
            adminPhoneNumber: '+19876543210',
            adminPreferences: {
              emailNotifications: true,
              theme: 'dark',
              language: 'en',
              timezone: 'UTC',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Organization and SUPER_ADMIN user created successfully.',
      type: OrganizationResponseDto,
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
                'adminPassword must be longer than or equal to 8 characters',
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
        'Insufficient permissions to create organization with SUPER_ADMIN user.',
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
      description: 'Organization or SUPER_ADMIN user already exists.',
      schema: {
        example: {
          statusCode: 409,
          message: 'Organization name already exists.',
          error: 'Conflict',
        },
      },
    }),
  );
}
