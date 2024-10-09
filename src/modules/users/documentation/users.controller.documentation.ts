import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UserResponseDto } from '../dtos/user-response.dto';
import { HttpStatus } from '@nestjs/common';
import { UserStatus } from '../entities/user-status.entity';

export function FindOneByIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a user by ID' }),
    ApiParam({ name: 'id', required: true, description: 'User ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User found',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
  );
}

export function FindAllPaginatedDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get paginated list of users' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User list retrieved successfully',
      type: [UserResponseDto],
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: 'number',
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: 'number',
      description: 'Number of items per page',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: UserStatus,
      description: 'Filter users by status',
    }),
  );
}

export function CreateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User created successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'User with provided email or username already exists',
    }),
  );
}

export function UpdateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user details' }),
    ApiParam({ name: 'id', required: true, description: 'User ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User updated successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to update user',
    }),
  );
}

export function DeleteUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a user' }),
    ApiParam({ name: 'id', required: true, description: 'User ID' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'User deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to delete user',
    }),
  );
}

export function UpdateUserStatusDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user status' }),
    ApiParam({ name: 'id', required: true, description: 'User ID' }),
    ApiQuery({
      name: 'status',
      required: true,
      enum: UserStatus,
      description: 'New status for the user',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User status updated successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to update user status',
    }),
  );
}

export function DeactivateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Deactivate a user' }),
    ApiParam({ name: 'id', required: true, description: 'User ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User deactivated successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to deactivate user',
    }),
  );
}

export function ActivateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Activate a user' }),
    ApiParam({ name: 'id', required: true, description: 'User ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User activated successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Not authorized to activate user',
    }),
  );
}

export function SearchUsersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Search users with query' }),
    ApiQuery({
      name: 'query',
      required: true,
      type: 'string',
      description: 'Search query',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: 'number',
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: 'number',
      description: 'Number of items per page',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Search results',
      type: 'PaginationResult<UserResponseDto>',
    }),
  );
}
