import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrganizationResponseDto } from '../dtos/organization-response.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { OrganizationStatus } from '../entities/organization-status.enum';

export function UpdateOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update organization details',
      description: `
        Updates an existing organization's information.
        - Requires organization admin or system admin privileges
        - Partial updates are supported (only provided fields will be updated)
        - Status changes require additional authorization and reason
        - Blockchain address cannot be updated through this endpoint
        - Document verification is required for certain updates
      `,
    }),
    ApiBody({
      type: UpdateOrganizationDto,
      examples: {
        basicUpdate: {
          summary: 'Basic Information Update',
          description: 'Update basic organization details',
          value: {
            name: 'Acme Corp Updated',
            contactEmail: 'new.contact@acme.com',
            description: 'Updated company description',
          },
        },
        statusUpdate: {
          summary: 'Status Change',
          description: 'Update organization status with reason',
          value: {
            status: OrganizationStatus.ACTIVE,
            statusChangeReason:
              'Organization has completed verification process',
            verificationDocuments: [
              {
                documentType: 'BUSINESS_LICENSE',
                documentUrl: 'https://docs.example.com/license.pdf',
                expiryDate: '2025-12-31',
              },
            ],
            changeReference: 'VER-2024-001',
          },
        },
        settingsUpdate: {
          summary: 'Settings Update',
          description: 'Update organization settings and compliance info',
          value: {
            settings: {
              requireTwoFactorAuth: true,
              allowExternalVerifiers: false,
              documentRetentionDays: 730,
              autoArchiveEnabled: true,
            },
            complianceInfo: {
              taxId: '123-45-6789',
              registrationNumber: 'REG123456',
              licenses: ['Business License', 'Industry Certification'],
              certifications: ['ISO 27001', 'SOC 2'],
            },
            address: {
              streetAddress: '789 New Street',
              city: 'New York',
              state: 'NY',
              country: 'USA',
              postalCode: '10001',
            },
          },
        },
        fullUpdate: {
          summary: 'Comprehensive Update',
          description: 'Update multiple aspects of organization',
          value: {
            name: 'Acme Corporation International',
            contactEmail: 'global.contact@acme.com',
            contactPhoneNumber: '+1-555-0123',
            industry: 'Technology & Services',
            description: 'Global leader in technology solutions',
            website: 'https://www.acme-global.com',
            logoUrl: 'https://www.acme-global.com/logo.png',
            status: OrganizationStatus.VERIFIED,
            statusChangeReason: 'Completed global verification',
            changeReference: 'GLOB-2024-001',
            verificationDocuments: [
              {
                documentType: 'GLOBAL_CERTIFICATION',
                documentUrl: 'https://docs.example.com/global-cert.pdf',
                expiryDate: '2026-12-31',
              },
            ],
            settings: {
              requireTwoFactorAuth: true,
              allowExternalVerifiers: true,
              documentRetentionDays: 1825,
              autoArchiveEnabled: true,
            },
            address: {
              streetAddress: '1 Global Plaza',
              city: 'London',
              state: null,
              country: 'UK',
              postalCode: 'EC1A 1BB',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Organization updated successfully',
      type: OrganizationResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid update data',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'Invalid email format',
            'Name must be between 2 and 200 characters',
            'Invalid phone number format',
          ],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
      schema: {
        example: {
          statusCode: 403,
          message: 'Insufficient permissions to update organization status',
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
    ApiResponse({
      status: 409,
      description: 'Conflict in update operation',
      schema: {
        example: {
          statusCode: 409,
          message: 'Organization name already in use',
          error: 'Conflict',
        },
      },
    }),
    ApiResponse({
      status: 422,
      description: 'Invalid status transition or missing required documents',
      schema: {
        example: {
          statusCode: 422,
          message:
            'Cannot transition from PENDING_APPROVAL to VERIFIED without required verification documents',
          error: 'Unprocessable Entity',
        },
      },
    }),
  );
}

export function UpdateOrganizationStatusDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update organization status',
      description: `
        Updates the status of an organization.
        - Requires system admin privileges
        - Status change reason is mandatory
        - May require supporting documentation
        - Triggers notifications to organization admins
        - Updates audit logs
      `,
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['status', 'statusChangeReason'],
        properties: {
          status: {
            type: 'string',
            enum: Object.values(OrganizationStatus),
            description: 'New status for the organization',
          },
          statusChangeReason: {
            type: 'string',
            description: 'Reason for status change',
            maxLength: 500,
          },
          verificationDocuments: {
            type: 'array',
            description: 'Supporting documents for status change',
            items: {
              type: 'object',
              properties: {
                documentType: { type: 'string' },
                documentUrl: { type: 'string' },
                expiryDate: { type: 'string', format: 'date' },
              },
            },
          },
        },
      },
      examples: {
        activation: {
          summary: 'Activate Organization',
          value: {
            status: OrganizationStatus.ACTIVE,
            statusChangeReason: 'All verification requirements met',
            verificationDocuments: [
              {
                documentType: 'VERIFICATION_APPROVAL',
                documentUrl: 'https://docs.example.com/verification.pdf',
                expiryDate: '2025-12-31',
              },
            ],
          },
        },
        suspension: {
          summary: 'Suspend Organization',
          value: {
            status: OrganizationStatus.SUSPENDED,
            statusChangeReason: 'Compliance violations detected',
            verificationDocuments: [
              {
                documentType: 'VIOLATION_REPORT',
                documentUrl: 'https://docs.example.com/violation.pdf',
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Organization status updated successfully',
      type: OrganizationResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid status change request',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions for status change',
    }),
    ApiResponse({
      status: 422,
      description: 'Invalid status transition',
    }),
  );
}
