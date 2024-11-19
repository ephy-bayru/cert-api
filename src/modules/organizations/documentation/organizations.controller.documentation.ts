import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { OrganizationUserRole } from '../entities/organization-user-role.enum';
import { UpdateOrganizationUserDto } from '../dtos/update-organization-user.dto';
import { OrganizationUserResponseDto } from '../dtos/organization-user-response.dto';

export const UpdateOrganizationUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update organization user details',
      description: "Updates an existing organization user's information",
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'User ID',
    }),
    ApiBody({ type: UpdateOrganizationUserDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User updated successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid update data provided',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to update user',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Email or username already in use',
    }),
  );
};

export const ActivateOrganizationUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Activate organization user',
      description: 'Activates a deactivated organization user',
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'User ID',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User activated successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'User cannot be activated in current state',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to activate users',
    }),
  );
};

export const DeactivateOrganizationUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Deactivate organization user',
      description: 'Deactivates an active organization user',
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'User ID',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: {
            type: 'string',
            description: 'Reason for deactivation',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User deactivated successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'User cannot be deactivated in current state',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to deactivate users',
    }),
  );
};

export const UpdateOrganizationUserRoleDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update organization user role',
      description: 'Updates the role of an organization user',
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'User ID',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['role'],
        properties: {
          role: {
            type: 'string',
            enum: Object.values(OrganizationUserRole),
            description: 'New role for the user',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User role updated successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid role provided',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to update user roles',
    }),
  );
};

export const LockOrganizationUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Lock organization user account',
      description: "Locks an organization user's account",
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'User ID',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User account locked successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'User account cannot be locked in current state',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to lock user accounts',
    }),
  );
};

export const UnlockOrganizationUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Unlock organization user account',
      description: "Unlocks an organization user's locked account",
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'User ID',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User account unlocked successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'User account cannot be unlocked in current state',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to unlock user accounts',
    }),
  );
};

export const FindOrganizationUserByIdDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get organization user by ID',
      description:
        'Retrieves detailed information about a specific organization user',
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'User ID',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User found',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to view user details',
    }),
  );
};

export const FindOrganizationUserByEmailDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Find organization user by email',
      description: 'Finds an organization user by their email address',
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiParam({
      name: 'email',
      required: true,
      description: 'User email',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User found',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to search users',
    }),
  );
};

export const ListOrganizationUsersDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'List organization users',
      description: 'Retrieves a paginated list of users within an organization',
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Users retrieved successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Organization not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to list organization users',
    }),
  );
};

export const SearchOrganizationUsersDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Search organization users',
      description:
        'Searches for users within an organization using specified criteria',
    }),
    ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Organization ID',
    }),
    ApiQuery({
      name: 'searchTerm',
      required: true,
      type: String,
      description: 'Search term to find users',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Search results retrieved successfully',
      type: OrganizationUserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Organization not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to search organization users',
    }),
  );
};
