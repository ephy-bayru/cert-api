import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { OrganizationResponseDto } from '../dtos/organization-response.dto';

export function ActivateOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activate a pending organization',
      description: `
        Activates an organization that is currently in \`PENDING_APPROVAL\` status.

        **Access:** Requires Admin privileges.

        **Notes:**
        - Changes organization status to \`ACTIVE\`.
        - Activates associated admin users.
        - Triggers notifications to organization admins.
        - Records activation in audit logs.
      `,
    }),
    // Optionally, include an authentication decorator
    // @ApiBearerAuth()
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization unique identifier',
    }),
    ApiBody({
      type: 'string',
      required: true,
      description: 'Activation details',
      examples: {
        basic: {
          summary: 'Basic Activation',
          value: {
            reason: 'All verification requirements met',
          },
        },
        withDocuments: {
          summary: 'Activation with Verification Documents',
          value: {
            reason: 'Verification process completed successfully',
            verificationDocuments: [
              {
                type: 'BUSINESS_LICENSE',
                url: 'https://docs.example.com/license.pdf',
                verifiedAt: '2024-01-15T10:00:00Z',
              },
              {
                type: 'TAX_CERTIFICATE',
                url: 'https://docs.example.com/tax.pdf',
                verifiedAt: '2024-01-15T10:05:00Z',
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Organization activated successfully.',
      type: OrganizationResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid activation request.',
      content: {
        'application/json': {
          schema: {
            example: {
              statusCode: 400,
              message: 'Organization must be in PENDING_APPROVAL status to be activated.',
              error: 'Bad Request',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions to activate organization.',
    }),
    ApiResponse({
      status: 404,
      description: 'Organization not found.',
    }),
    ApiResponse({
      status: 422,
      description: 'Required verification documents missing or invalid.',
    }),
  );
}


export function SuspendOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Suspend organization',
      description: `
        Suspends an active organization.
        - Changes organization status to SUSPENDED
        - Disables document verification capabilities
        - Logs out all active users
        - Prevents new logins except for admins
        - Records suspension details in audit logs
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization identifier',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['reason', 'suspensionDetails'],
        properties: {
          reason: {
            type: 'string',
            description: 'Reason for suspension',
            maxLength: 500,
          },
          suspensionDetails: {
            type: 'object',
            properties: {
              duration: {
                type: 'number',
                description: 'Suspension duration in days (0 for indefinite)',
              },
              effectiveFrom: {
                type: 'string',
                format: 'date-time',
              },
              requiresReview: {
                type: 'boolean',
              },
              notificationMessage: {
                type: 'string',
              },
            },
          },
          supportingDocuments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                url: { type: 'string' },
              },
            },
          },
        },
      },
      examples: {
        temporary: {
          summary: 'Temporary Suspension',
          value: {
            reason: 'Compliance review required',
            suspensionDetails: {
              duration: 30,
              effectiveFrom: '2024-01-15T00:00:00Z',
              requiresReview: true,
              notificationMessage:
                'Organization suspended pending compliance review',
            },
          },
        },
        indefinite: {
          summary: 'Indefinite Suspension',
          value: {
            reason: 'Multiple policy violations detected',
            suspensionDetails: {
              duration: 0,
              effectiveFrom: '2024-01-15T00:00:00Z',
              requiresReview: true,
              notificationMessage:
                'Organization suspended indefinitely due to policy violations',
            },
            supportingDocuments: [
              {
                type: 'VIOLATION_REPORT',
                url: 'https://docs.example.com/violations.pdf',
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Organization suspended successfully',
      type: OrganizationResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid suspension request',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
  );
}

export function ArchiveOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Archive organization',
      description: `
        Archives an organization and its data.
        - Changes status to ARCHIVED
        - Maintains data for compliance
        - Disables all access except auditors
        - Archives related documents
        - Exports organization data
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: {
            type: 'string',
            description: 'Reason for archiving',
            maxLength: 500,
          },
          retentionPeriod: {
            type: 'number',
            description: 'Data retention period in days',
          },
          exportData: {
            type: 'boolean',
            description: 'Whether to export organization data',
          },
        },
      },
      examples: {
        standard: {
          summary: 'Standard Archive',
          value: {
            reason: 'Organization inactive for 12 months',
            retentionPeriod: 2555, // 7 years
            exportData: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Organization archived successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid archive request',
    }),
  );
}

export function UpdateOrganizationComplianceDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update organization compliance status',
      description: `
        Updates organization's compliance information and status.
        - Updates compliance documents
        - Manages compliance certifications
        - Updates compliance status
        - Triggers compliance reviews
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          complianceStatus: {
            type: 'string',
            enum: ['COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW'],
          },
          documents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                url: { type: 'string' },
                expiryDate: { type: 'string', format: 'date' },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Compliance status updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid compliance update',
    }),
  );
}

export function ManageOrganizationSettingsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Manage organization settings',
      description: `
        Updates organization settings and configurations.
        - Security settings
        - Document retention policies
        - Verification requirements
        - Notification preferences
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          settings: {
            type: 'object',
            properties: {
              requireTwoFactorAuth: { type: 'boolean' },
              allowExternalVerifiers: { type: 'boolean' },
              documentRetentionDays: { type: 'number' },
              autoArchiveEnabled: { type: 'boolean' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Settings updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid settings',
    }),
  );
}
