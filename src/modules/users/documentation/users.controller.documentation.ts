import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserResponseDto } from '../dtos/user-response.dto';
import { HttpStatus } from '@nestjs/common';

export function FindOneByIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a user by ID' }),
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
  );
}

export function CreateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user or users' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User or Users created successfully',
      type: UserResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data',
    }),
  );
}

export function UpdateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user details' }),
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
  );
}

export function DeleteUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
  );
}

export function DeactivateUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Deactivate a user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User deactivated successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
  );
}

export function SearchUsersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Search users with query' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Search results',
      type: 'PaginationResult<UserResponseDto>',
    }),
  );
}
