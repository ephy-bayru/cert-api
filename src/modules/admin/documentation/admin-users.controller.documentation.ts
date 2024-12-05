import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAdminUserDto } from '../dtos/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dtos/update-admin-user.dto';
import { AdminRole } from '../entities/admin-user.entity';
import { UpdateOrganizationDto } from '@modules/organizations/dtos/update-organization.dto';
import { CreateOrganizationDto } from '@modules/organizations/dtos/create-organization.dto';
import { OrganizationStatus } from '@modules/organizations/entities/organization-status.enum';
import { UserStatus } from '@modules/users/entities/user-status.entity';
import { CreateUserDto } from '@modules/users/dtos/create-user.dto';
import { UpdateUserDto } from '@modules/users/dtos/update-user.dto';

export function ListAdminUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List admin users',
      description: `
        Retrieves a paginated list of admin users.
        
        **Features:**
        - Supports pagination
        - Supports searching by name
        - Supports sorting by multiple fields
        - Returns sorted by most recent by default
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
      name: 'search',
      required: false,
      type: String,
      description: 'Search term for filtering admin users by name',
      example: 'john',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved list of admin users',
      content: {
        'application/json': {
          schema: {
            properties: {
              data: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/AdminUserResponseDto',
                },
                description: 'Array of admin users',
              },
              total: {
                type: 'number',
                description: 'Total number of records',
                example: 100,
              },
              page: {
                type: 'number',
                description: 'Current page number',
                example: 1,
              },
              limit: {
                type: 'number',
                description: 'Number of items per page',
                example: 10,
              },
            },
            required: ['data', 'total', 'page', 'limit'],
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions to list admin users',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 403,
              },
              message: {
                type: 'string',
                example: 'Forbidden resource',
              },
              error: {
                type: 'string',
                example: 'Forbidden',
              },
            },
          },
        },
      },
    }),
  );
}

export function CreateAdminUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create admin user',
      description: `
        Creates a new admin user in the system.

        **Access Level:** Super Admin only
        
        **Notes:**
        - Email must be unique
        - Password must meet security requirements
        - Role defaults to ADMIN if not specified
      `,
    }),
    ApiBody({
      type: CreateAdminUserDto,
      description: 'Admin user creation data',
      examples: {
        'Basic Admin': {
          value: {
            email: 'admin@example.com',
            password: 'StrongP@ss123',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        'Admin with Role': {
          value: {
            email: 'support@example.com',
            password: 'StrongP@ss123',
            firstName: 'Jane',
            lastName: 'Smith',
            role: AdminRole.SUPPORT,
            phoneNumber: '+1234567890',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Admin user created successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/AdminUserResponseDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 400,
              },
              message: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: [
                  'email must be a valid email',
                  'password must be at least 8 characters',
                  'password must contain at least one uppercase letter',
                ],
              },
              error: {
                type: 'string',
                example: 'Bad Request',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Email already exists',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 409,
              },
              message: {
                type: 'string',
                example: 'Email is already in use',
              },
              error: {
                type: 'string',
                example: 'Conflict',
              },
            },
          },
        },
      },
    }),
  );
}

export function UpdateAdminUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update admin user',
      description: `
        Updates an existing admin user's information.

        **Access Level:** Super Admin only
        
        **Notes:**
        - Only provided fields will be updated
        - Email uniqueness is enforced if changed
        - Cannot change role to SUPER_ADMIN
        - Password must meet security requirements if changed
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Admin user ID',
      required: true,
    }),
    ApiBody({
      type: UpdateAdminUserDto,
      description: 'Admin user update data',
      examples: {
        'Basic Info Update': {
          value: {
            firstName: 'John',
            lastName: 'Smith',
            phoneNumber: '+1234567890',
          },
        },
        'Role Update': {
          value: {
            role: AdminRole.SUPPORT,
          },
        },
        'Password Update': {
          value: {
            password: 'NewStrongP@ss123',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Admin user updated successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/AdminUserResponseDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 400,
              },
              message: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: [
                  'email must be a valid email',
                  'password must meet security requirements',
                ],
              },
              error: {
                type: 'string',
                example: 'Bad Request',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Admin user does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 404,
              },
              message: {
                type: 'string',
                example: 'Admin user not found',
              },
              error: {
                type: 'string',
                example: 'Not Found',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - New email already exists',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 409,
              },
              message: {
                type: 'string',
                example: 'Email is already in use',
              },
              error: {
                type: 'string',
                example: 'Conflict',
              },
            },
          },
        },
      },
    }),
  );
}

export function DeleteAdminUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete admin user',
      description: `
        Deletes an admin user from the system.

        **Access Level:** Super Admin only
        
        **Notes:**
        - This is a soft delete operation
        - User data is retained for audit purposes
        - Cannot delete the last SUPER_ADMIN user
        - The operation returns no content on success (204)
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Admin user ID to delete',
      required: true,
    }),
    ApiResponse({
      status: 204,
      description: 'Admin user successfully deleted',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 403,
              },
              message: {
                type: 'string',
                example: 'Insufficient permissions to delete admin user',
              },
              error: {
                type: 'string',
                example: 'Forbidden',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Admin user does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 404,
              },
              message: {
                type: 'string',
                example: 'Admin user not found',
              },
              error: {
                type: 'string',
                example: 'Not Found',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Cannot delete last SUPER_ADMIN',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 409,
              },
              message: {
                type: 'string',
                example: 'Cannot delete the last SUPER_ADMIN user',
              },
              error: {
                type: 'string',
                example: 'Conflict',
              },
            },
          },
        },
      },
    }),
  );
}

export function ActivateAdminUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activate admin user',
      description: `
        Activates a deactivated admin user account.

        **Access Level:** Super Admin only
        
        **Notes:**
        - Only deactivated users can be activated
        - Action is recorded in audit logs
        - User status is updated to active
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Admin user ID to activate',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Admin user successfully activated',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - User is already active',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 400,
              },
              message: {
                type: 'string',
                example: 'User is already active',
              },
              error: {
                type: 'string',
                example: 'Bad Request',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 403,
              },
              message: {
                type: 'string',
                example: 'Insufficient permissions to activate admin user',
              },
              error: {
                type: 'string',
                example: 'Forbidden',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Admin user does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 404,
              },
              message: {
                type: 'string',
                example: 'Admin user not found',
              },
              error: {
                type: 'string',
                example: 'Not Found',
              },
            },
          },
        },
      },
    }),
  );
}

export function DeactivateAdminUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deactivate admin user',
      description: `
        Deactivates an active admin user account.

        **Access Level:** Super Admin only
        
        **Notes:**
        - Only active users can be deactivated
        - Cannot deactivate the last SUPER_ADMIN
        - Action is recorded in audit logs
        - User status is updated to inactive
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Admin user ID to deactivate',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Admin user successfully deactivated',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - User is already inactive',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 400,
              },
              message: {
                type: 'string',
                example: 'User is already inactive',
              },
              error: {
                type: 'string',
                example: 'Bad Request',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 403,
              },
              message: {
                type: 'string',
                example: 'Insufficient permissions to deactivate admin user',
              },
              error: {
                type: 'string',
                example: 'Forbidden',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Admin user does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 404,
              },
              message: {
                type: 'string',
                example: 'Admin user not found',
              },
              error: {
                type: 'string',
                example: 'Not Found',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Cannot deactivate last SUPER_ADMIN',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: {
                type: 'number',
                example: 409,
              },
              message: {
                type: 'string',
                example: 'Cannot deactivate the last SUPER_ADMIN user',
              },
              error: {
                type: 'string',
                example: 'Conflict',
              },
            },
          },
        },
      },
    }),
  );
}

export function LockAdminUserAccountDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lock admin user account',
      description: `
        Locks an admin user's account.

        **Access Level:** Super Admin only
        
        **Notes:**
        - Locked users cannot log in
        - Only active users can be locked
        - Action is recorded in audit logs
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Admin user ID to lock',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Admin user account successfully locked',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - User account is already locked or inactive',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'string',
                example: 'User account is already locked or inactive',
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 403 },
              message: {
                type: 'string',
                example: 'Insufficient permissions to lock admin user account',
              },
              error: { type: 'string', example: 'Forbidden' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Admin user does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Admin user not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function UnlockAdminUserAccountDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Unlock admin user account',
      description: `
        Unlocks an admin user's account.

        **Access Level:** Super Admin only
        
        **Notes:**
        - Only locked users can be unlocked
        - Action is recorded in audit logs
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Admin user ID to unlock',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Admin user account successfully unlocked',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - User account is not locked',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'string',
                example: 'User account is not locked',
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 403 },
              message: {
                type: 'string',
                example:
                  'Insufficient permissions to unlock admin user account',
              },
              error: { type: 'string', example: 'Forbidden' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Admin user does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Admin user not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function FindOrganizationByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find organization by ID',
      description: `
        Retrieves detailed information about a specific organization.

        **Access Level:** Admin users
        
        **Notes:**
        - Requires a valid organization ID
        - Returns organization details including status and industry
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization ID',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Organization retrieved successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/OrganizationResponseDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Organization does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Organization not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
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
        Retrieves a paginated list of organizations.

        **Features:**
        - Supports pagination
        - Supports filtering by status and industry
        - Supports searching by name
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
      description: 'Filter organizations by status',
    }),
    ApiQuery({
      name: 'industry',
      required: false,
      type: String,
      description: 'Filter organizations by industry',
      example: 'Technology',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search term for filtering organizations by name',
      example: 'Acme Corp',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved list of organizations',
      content: {
        'application/json': {
          schema: {
            properties: {
              data: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/OrganizationResponseDto',
                },
                description: 'Array of organizations',
              },
              total: {
                type: 'number',
                description: 'Total number of records',
                example: 50,
              },
              page: {
                type: 'number',
                description: 'Current page number',
                example: 1,
              },
              limit: {
                type: 'number',
                description: 'Number of items per page',
                example: 10,
              },
            },
            required: ['data', 'total', 'page', 'limit'],
          },
        },
      },
    }),
  );
}

export function CreateOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create organization',
      description: `
        Creates a new organization in the system.

        **Access Level:** Admin users
        
        **Notes:**
        - Organization name must be unique
        - Provides initial status and industry details
      `,
    }),
    ApiBody({
      type: CreateOrganizationDto,
      description: 'Organization creation data',
      examples: {
        'New Organization': {
          value: {
            name: 'Acme Corporation',
            industry: 'Manufacturing',
            address: '123 Main St, Anytown, USA',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Organization created successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/OrganizationResponseDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'array',
                items: { type: 'string' },
                example: ['name must be a string', 'industry must be a string'],
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Organization name already exists',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 409 },
              message: {
                type: 'string',
                example: 'Organization name already in use',
              },
              error: { type: 'string', example: 'Conflict' },
            },
          },
        },
      },
    }),
  );
}

export function UpdateOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update organization',
      description: `
        Updates an existing organization's information.

        **Access Level:** Admin users
        
        **Notes:**
        - Only provided fields will be updated
        - Cannot change organization ID
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization ID',
      required: true,
    }),
    ApiBody({
      type: UpdateOrganizationDto,
      description: 'Organization update data',
      examples: {
        'Update Address': {
          value: {
            address: '456 Elm St, Othertown, USA',
          },
        },
        'Update Industry': {
          value: {
            industry: 'Technology',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Organization updated successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/OrganizationResponseDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'array',
                items: { type: 'string' },
                example: ['industry must be a valid industry type'],
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Organization does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Organization not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function DeleteOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Archive organization',
      description: `
        Archives an organization instead of permanently deleting it.

        **Access Level:** Admin users
        
        **Notes:**
        - Archived organizations are not visible in active lists
        - Data is retained for audit purposes
        - Operation returns no content on success (204)
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization ID to archive',
      required: true,
    }),
    ApiResponse({
      status: 204,
      description: 'Organization successfully archived',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Organization does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Organization not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function ApproveOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Approve organization',
      description: `
        Approves a pending organization.

        **Access Level:** Admin users
        
        **Notes:**
        - Organization status is updated to approved
        - Action is recorded in audit logs
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization ID to approve',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Organization successfully approved',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Organization is not in a pending state',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'string',
                example: 'Organization is not pending approval',
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Organization does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Organization not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function SuspendOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Suspend organization',
      description: `
        Suspends an active organization.

        **Access Level:** Admin users
        
        **Notes:**
        - Requires a reason for suspension
        - Organization status is updated to suspended
        - Action is recorded in audit logs
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization ID to suspend',
      required: true,
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for suspension' },
        },
        required: ['reason'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Organization successfully suspended',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request - Organization is not active or reason is missing',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'string',
                example: 'Organization is not active or reason is missing',
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Organization does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Organization not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function ArchiveOrganizationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Archive organization',
      description: `
        Archives an organization.

        **Access Level:** Admin users
        
        **Notes:**
        - Organization status is updated to archived
        - Action is recorded in audit logs
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'Organization ID to archive',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Organization successfully archived',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Organization does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'Organization not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function FindUserByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find user by ID',
      description: `
        Retrieves detailed information about a specific user.

        **Access Level:** Admin users
        
        **Notes:**
        - Requires a valid user ID
        - Returns user details including status and email
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'User ID',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'User retrieved successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/UserResponseDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - User does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function ListUsersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'List users',
      description: `
        Retrieves a paginated list of users.

        **Features:**
        - Supports pagination
        - Supports filtering by status
        - Supports searching by email
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
      enum: UserStatus,
      description: 'Filter users by status',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search term for filtering users by email',
      example: 'user@example.com',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved list of users',
      content: {
        'application/json': {
          schema: {
            properties: {
              data: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/UserResponseDto',
                },
                description: 'Array of users',
              },
              total: {
                type: 'number',
                description: 'Total number of records',
                example: 200,
              },
              page: {
                type: 'number',
                description: 'Current page number',
                example: 1,
              },
              limit: {
                type: 'number',
                description: 'Number of items per page',
                example: 10,
              },
            },
            required: ['data', 'total', 'page', 'limit'],
          },
        },
      },
    }),
  );
}

export function CreateUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create user',
      description: `
        Creates a new user in the system.

        **Access Level:** Admin users
        
        **Notes:**
        - Email must be unique
        - Password must meet security requirements
      `,
    }),
    ApiBody({
      type: CreateUserDto,
      description: 'User creation data',
      examples: {
        'New User': {
          value: {
            email: 'newuser@example.com',
            password: 'SecureP@ssw0rd',
            firstName: 'Alice',
            lastName: 'Johnson',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/UserResponseDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'email must be a valid email',
                  'password is too weak',
                ],
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Email already exists',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 409 },
              message: { type: 'string', example: 'Email is already in use' },
              error: { type: 'string', example: 'Conflict' },
            },
          },
        },
      },
    }),
  );
}

export function UpdateUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user',
      description: `
        Updates an existing user's information.

        **Access Level:** Admin users
        
        **Notes:**
        - Only provided fields will be updated
        - Email uniqueness is enforced if changed
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'User ID',
      required: true,
    }),
    ApiBody({
      type: UpdateUserDto,
      description: 'User update data',
      examples: {
        'Update Email': {
          value: {
            email: 'updateduser@example.com',
          },
        },
        'Update Password': {
          value: {
            password: 'NewSecureP@ssw0rd',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/UserResponseDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'array',
                items: { type: 'string' },
                example: ['email must be a valid email'],
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - User does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Email already exists',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 409 },
              message: { type: 'string', example: 'Email is already in use' },
              error: { type: 'string', example: 'Conflict' },
            },
          },
        },
      },
    }),
  );
}

export function DeleteUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deactivate user',
      description: `
        Deactivates a user account instead of permanently deleting it.

        **Access Level:** Admin users
        
        **Notes:**
        - Deactivated users cannot log in
        - Data is retained for audit purposes
        - Operation returns no content on success (204)
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'User ID to deactivate',
      required: true,
    }),
    ApiResponse({
      status: 204,
      description: 'User successfully deactivated',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - User does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function ActivateUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activate user',
      description: `
        Activates a deactivated user account.

        **Access Level:** Admin users
        
        **Notes:**
        - Only deactivated users can be activated
        - User status is updated to active
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'User ID to activate',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'User successfully activated',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - User is already active',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'string', example: 'User is already active' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - User does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function DeactivateUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deactivate user',
      description: `
        Deactivates an active user account.

        **Access Level:** Admin users
        
        **Notes:**
        - Only active users can be deactivated
        - User status is updated to inactive
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'User ID to deactivate',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'User successfully deactivated',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - User is already inactive',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'string', example: 'User is already inactive' },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - User does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function LockUserAccountDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lock user account',
      description: `
        Locks a user's account.

        **Access Level:** Admin users
        
        **Notes:**
        - Locked users cannot log in
        - Only active users can be locked
        - Action is recorded in audit logs
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'User ID to lock',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'User account successfully locked',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - User account is already locked or inactive',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'string',
                example: 'User account is already locked or inactive',
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - User does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}

export function UnlockUserAccountDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Unlock user account',
      description: `
        Unlocks a user's account.

        **Access Level:** Admin users
        
        **Notes:**
        - Only locked users can be unlocked
        - Action is recorded in audit logs
      `,
    }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      description: 'User ID to unlock',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'User account successfully unlocked',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - User account is not locked',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: {
                type: 'string',
                example: 'User account is not locked',
              },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - User does not exist',
      content: {
        'application/json': {
          schema: {
            properties: {
              statusCode: { type: 'number', example: 404 },
              message: { type: 'string', example: 'User not found' },
              error: { type: 'string', example: 'Not Found' },
            },
          },
        },
      },
    }),
  );
}
