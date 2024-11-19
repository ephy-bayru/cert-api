import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CreateOrganizationUserDto } from '../dtos/create-organization-user.dto';
import { UpdateOrganizationUserDto } from '../dtos/update-organization-user.dto';
import { OrganizationUserResponseDto } from '../dtos/organization-user-response.dto';
import { OrganizationUserRole } from '../entities/organization-user-role.enum';
import { ReasonDto } from '../dtos/reason.dto';

export function CreateOrganizationUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create organization user',
      description: `
        Creates a new user within an organization.
        - Requires organization admin privileges
        - Sends email verification to new user
        - Configures role-based permissions
        - Sets up 2FA if required by organization
        - Creates user profile with provided information
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Organization identifier',
    }),
    ApiBody({
      type: CreateOrganizationUserDto,
      examples: {
        basicUser: {
          summary: 'Basic User',
          description: 'Create basic organization member',
          value: {
            email: 'user@organization.com',
            userName: 'johnsmith',
            password: 'StrongP@ss123',
            firstName: 'John',
            lastName: 'Smith',
            role: OrganizationUserRole.MEMBER,
          },
        },
        verifier: {
          summary: 'Document Verifier',
          description: 'Create user with document verification privileges',
          value: {
            email: 'verifier@organization.com',
            userName: 'sarahverifier',
            password: 'SecureP@ss456',
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: OrganizationUserRole.VERIFIER,
            title: 'Senior Document Verifier',
            department: 'Verification',
            permissions: {
              canVerifyDocuments: true,
              documentTypes: ['BUSINESS', 'LEGAL', 'FINANCIAL'],
              verificationLimit: 100,
            },
          },
        },
        adminUser: {
          summary: 'Organization Admin',
          description: 'Create admin user with full permissions',
          value: {
            email: 'admin@organization.com',
            userName: 'adminuser',
            password: 'AdminP@ss789',
            firstName: 'Admin',
            lastName: 'User',
            role: OrganizationUserRole.ADMIN,
            title: 'Organization Administrator',
            department: 'Administration',
            permissions: {
              canVerifyDocuments: true,
              canManageUsers: true,
              canAccessDocuments: true,
              canManageSettings: true,
            },
            preferences: {
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
      description: 'Organization user created successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid user data',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'Invalid email format',
            'Password does not meet complexity requirements',
            'Username must be between 3 and 100 characters',
          ],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
    ApiResponse({
      status: 409,
      description: 'User already exists',
      schema: {
        example: {
          statusCode: 409,
          message: 'Email or username already in use within organization',
          error: 'Conflict',
        },
      },
    }),
  );
}

export function UpdateOrganizationUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update organization user',
      description: `
        Updates an existing organization user's information.
        - Requires admin privileges or self-update
        - Supports partial updates
        - Validates role changes and permissions
        - Maintains audit trail of changes
        - Handles security-sensitive updates
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Organization identifier',
    }),
    ApiParam({
      name: 'userId',
      type: 'string',
      format: 'uuid',
      description: 'User identifier',
    }),
    ApiBody({
      type: UpdateOrganizationUserDto,
      examples: {
        basicUpdate: {
          summary: 'Basic Profile Update',
          value: {
            firstName: 'John Updated',
            lastName: 'Smith',
            phoneNumber: '+1234567890',
            title: 'Senior Member',
          },
        },
        roleUpdate: {
          summary: 'Role and Permissions Update',
          value: {
            role: OrganizationUserRole.VERIFIER,
            permissions: {
              canVerifyDocuments: true,
              documentTypes: ['BUSINESS', 'LEGAL'],
              verificationLimit: 50,
            },
            roleExpiresAt: '2024-12-31T23:59:59Z',
          },
        },
        securityUpdate: {
          summary: 'Security Settings Update',
          value: {
            newPassword: 'NewSecureP@ss123',
            twoFactorEnabled: true,
            restrictions: {
              ipWhitelist: ['192.168.1.1'],
              maxDailyVerifications: 100,
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'User updated successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid update data',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}

export function ListOrganizationUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization users',
      description: `
        Retrieves a paginated list of users within an organization.
        - Supports filtering by role, status, and department
        - Includes active and inactive users
        - Provides user activity information
        - Can be sorted by various criteria
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
    }),
    ApiQuery({
      name: 'role',
      required: false,
      enum: OrganizationUserRole,
    }),
    ApiQuery({
      name: 'isActive',
      required: false,
      type: Boolean,
    }),
    ApiQuery({
      name: 'department',
      required: false,
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Users retrieved successfully',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrganizationUserResponseDto' },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
      },
    }),
  );
}

export function ManageOrganizationUserStatusDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Manage user status',
      description: `
        Updates the status of an organization user (activate/deactivate/lock/unlock).
        - Requires admin privileges
        - Records reason for status change
        - Updates audit logs
        - Handles security implications
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
    }),
    ApiParam({
      name: 'userId',
      type: 'string',
      format: 'uuid',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['action', 'reason'],
        properties: {
          action: {
            type: 'string',
            enum: ['activate', 'deactivate', 'lock', 'unlock'],
          },
          reason: {
            type: 'string',
            maxLength: 500,
          },
        },
      },
      examples: {
        deactivate: {
          summary: 'Deactivate User',
          value: {
            action: 'deactivate',
            reason: 'Extended leave of absence',
          },
        },
        lock: {
          summary: 'Lock User Account',
          value: {
            action: 'lock',
            reason: 'Security policy violation',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'User status updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
  );
}

export function SearchOrganizationUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search organization users',
      description: `
        Performs a search across organization users.
        - Searches name, email, username, and department
        - Supports advanced filtering
        - Returns paginated results
        - Includes user activity metrics
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
    }),
    ApiQuery({
      name: 'search',
      required: true,
      type: String,
    }),
    ApiQuery({
      name: 'filters',
      required: false,
      type: 'object',
    }),
    ApiResponse({
      status: 200,
      description: 'Search results',
      type: OrganizationUserResponseDto,
      isArray: true,
    }),
  );
}

/**
 * Documentation for activating an organization user.
 */
export function ActivateOrganizationUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activate organization user',
      description: `
        Activates a deactivated organization user.
        - Requires organization admin privileges
        - Sends notification to the user
        - Updates user's status to active
        - Records the activating admin
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the organization',
    }),
    ApiParam({
      name: 'userId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the user to activate',
    }),
    ApiResponse({
      status: 200,
      description: 'User activated successfully',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}

/**
 * Documentation for deactivating an organization user.
 */
export function DeactivateOrganizationUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deactivate organization user',
      description: `
        Deactivates an active organization user.
        - Requires organization admin privileges
        - Requires a reason for deactivation
        - Updates user's status to inactive
        - Notifies the user of deactivation
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the organization',
    }),
    ApiParam({
      name: 'userId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the user to deactivate',
    }),
    ApiBody({
      type: ReasonDto,
      description: 'Reason for deactivation',
      examples: {
        example1: {
          summary: 'Deactivation reason',
          value: {
            reason: 'Violation of company policies',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'User deactivated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}

/**
 * Documentation for updating an organization user's role.
 */
export function UpdateOrganizationUserRoleDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update organization user role',
      description: `
        Updates the role of an organization user.
        - Requires organization admin privileges
        - Validates the new role
        - Records the admin who performed the update
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the organization',
    }),
    ApiParam({
      name: 'userId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the user whose role is to be updated',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: Object.values(OrganizationUserRole),
            description: 'New role for the user',
          },
        },
        required: ['role'],
      },
      examples: {
        example1: {
          summary: 'Update role to Verifier',
          value: {
            role: OrganizationUserRole.VERIFIER,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'User role updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid role specified',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}

/**
 * Documentation for locking an organization user's account.
 */
export function LockOrganizationUserAccountDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lock organization user account',
      description: `
        Locks a user's account, preventing login.
        - Requires organization admin privileges
        - Typically used for security purposes
        - User will be unable to log in until unlocked
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the organization',
    }),
    ApiParam({
      name: 'userId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the user to lock',
    }),
    ApiResponse({
      status: 200,
      description: 'User account locked successfully',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}

/**
 * Documentation for unlocking an organization user's account.
 */
export function UnlockOrganizationUserAccountDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Unlock organization user account',
      description: `
        Unlocks a user's account, allowing login.
        - Requires organization admin privileges
        - Restores user's ability to log in
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the organization',
    }),
    ApiParam({
      name: 'userId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the user to unlock',
    }),
    ApiResponse({
      status: 200,
      description: 'User account unlocked successfully',
    }),
    ApiResponse({
      status: 403,
      description: 'Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}

/**
 * Documentation for retrieving an organization user by ID.
 */
export function FindOrganizationUserByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get organization user by ID',
      description: `
        Retrieves detailed information about an organization user by their ID.
        - Requires organization membership
        - Returns user profile information
        - Excludes sensitive data
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the organization',
    }),
    ApiParam({
      name: 'userId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the user',
    }),
    ApiResponse({
      status: 200,
      description: 'User retrieved successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Access denied',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}

/**
 * Documentation for retrieving an organization user by email.
 */
export function FindOrganizationUserByEmailDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get organization user by email',
      description: `
        Retrieves detailed information about an organization user by their email address.
        - Requires organization membership
        - Returns user profile information
        - Excludes sensitive data
      `,
    }),
    ApiParam({
      name: 'organizationId',
      type: 'string',
      format: 'uuid',
      description: 'Identifier of the organization',
    }),
    ApiParam({
      name: 'email',
      type: 'string',
      description: 'Email address of the user',
    }),
    ApiResponse({
      status: 200,
      description: 'User retrieved successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Access denied',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
}
