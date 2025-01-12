import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseFilters,
  UseInterceptors,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UniqueUserValidationPipe } from '../pipes/unique-user-validation.pipe';

import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import {
  FindOneByIdDocs,
  FindAllPaginatedDocs,
  CreateUserDocs,
  UpdateUserDocs,
  DeleteUserDocs,
  DeactivateUserDocs,
  ActivateUserDocs,
  SearchUsersDocs,
  UpdateUserStatusDocs,
} from '../documentation/users.controller.documentation';

import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { CurrentUser } from '@common/decorators/current-user.decorator';

import { User } from '../entities/user.entity';
import { UserStatus } from '../entities/user-status.enum';
import { PaginationOptions } from 'src/common/interfaces/IPagination';

// GUARDS
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

// ROLES
import { GlobalRole } from '@common/enums/global-role.enum';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Users')
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(TransformInterceptor)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 1) Public signup endpoint:
   *    Allows unregistered users to create an account,
   *    which will default to PENDING_ACTIVATION and an END_USER role.
   */
  @Post()
  @CreateUserDocs()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body(UniqueUserValidationPipe) createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUser(createUserDto);
  }

  /**
   * 2) Searching users:
   *    Only platform admins, super admins, and end-users can search users.
   */
  @Get('search')
  @SearchUsersDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    GlobalRole.PLATFORM_ADMIN,
    GlobalRole.PLATFORM_SUPER_ADMIN,
    GlobalRole.END_USER,
  )
  @ApiBearerAuth()
  async searchUsers(
    @Query('query') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const paginationOptions: PaginationOptions<User> = { page, limit };
    return this.usersService.searchUsers(query, paginationOptions);
  }

  /**
   * 3) Get paginated users:
   *    Only platform admins and super admins can list all users.
   */
  @Get()
  @FindAllPaginatedDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  async findAllPaginated(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: UserStatus,
  ) {
    const paginationOptions: PaginationOptions<User> = { page, limit };
    if (status) {
      paginationOptions.options = { where: { status } };
    }
    return this.usersService.findAllPaginated(paginationOptions);
  }

  /**
   * 4) Get user by ID:
   *    Only platform admins, super admins, and the user themselves can fetch their own record.
   */
  @Get(':id')
  @FindOneByIdDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    GlobalRole.PLATFORM_ADMIN,
    GlobalRole.PLATFORM_SUPER_ADMIN,
    GlobalRole.END_USER,
  )
  @ApiBearerAuth()
  async findOneById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    if (
      currentUser.roles.includes(GlobalRole.END_USER) &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('You can only access your own user record.');
    }
    return this.usersService.findOneById(id);
  }

  /**
   * 5) Update user:
   *    Platform admins, super admins, and the user themselves can update their own profile.
   */
  @Put(':id')
  @UpdateUserDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    GlobalRole.PLATFORM_ADMIN,
    GlobalRole.PLATFORM_SUPER_ADMIN,
    GlobalRole.END_USER,
  )
  @ApiBearerAuth()
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    if (
      currentUser.roles.includes(GlobalRole.END_USER) &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('You can only update your own profile.');
    }
    return this.usersService.updateUser(id, updateUserDto, currentUser);
  }

  /**
   * 6) Delete user:
   *    Platform admins and super admins can delete any user.
   *    End-users can only delete their own account (soft delete).
   */
  @Delete(':id')
  @DeleteUserDocs()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    GlobalRole.PLATFORM_ADMIN,
    GlobalRole.PLATFORM_SUPER_ADMIN,
    GlobalRole.END_USER,
  )
  @ApiBearerAuth()
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    // If the current user is an END_USER, they can only delete their own account
    if (
      currentUser.roles.includes(GlobalRole.END_USER) &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('You can only delete your own account.');
    }

    return await this.usersService.deleteUser(id, currentUser);
  }

  /**
   * 7) Update user status:
   *    Only platform admins and super admins can update user status.
   */
  @Patch(':id/status')
  @UpdateUserStatusDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status: UserStatus,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.updateUserStatus(id, status, currentUser);
  }

  /**
   * 8) Deactivate user:
   *    Only platform admins and super admins can deactivate users.
   */
  @Patch(':id/deactivate')
  @DeactivateUserDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN, GlobalRole.END_USER)
  @ApiBearerAuth()
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.deactivateUser(id, currentUser);
  }

  /**
   * 9) Activate user:
   *    Only platform admins and super admins can activate users.
   */
  @Patch(':id/activate')
  @ActivateUserDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.activateUser(id, currentUser);
  }
}
