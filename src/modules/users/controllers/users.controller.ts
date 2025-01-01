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
  BadRequestException,
  UseGuards,
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
    // End-users can sign up without guards:
    return this.usersService.createUser(createUserDto);
  }

  /**
   * 2) Searching users:
   *    Typical usage for admins or logged-in users
   *    If you want it fully open or restricted, adjust Guards accordingly.
   */
  @Get('search')
  @SearchUsersDocs()
  @UseGuards(JwtAuthGuard) // e.g. at least require them to be logged in
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
   * 3) Get paginated users
   *    Typically an admin or privileged user might see all users.
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
   * 4) Get user by ID
   *    Admin-only or you might allow a user to fetch their own record.
   */
  @Get(':id')
  @FindOneByIdDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  async findOneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneById(id);
  }

  /**
   * 5) Update user
   *    Typically an admin changes user details, or a user can update their own profile
   *    if you do an additional check inside the service or with more complex guards.
   */
  @Put(':id')
  @UpdateUserDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN) // e.g. only platform admins can fully update
  @ApiBearerAuth()
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    // Optionally ensure currentUser is not undefined or only updating themselves
    return this.usersService.updateUser(id, updateUserDto, currentUser);
  }

  /**
   * 6) Delete user
   *    Hard or soft delete. Admin only in this example.
   */
  @Delete(':id')
  @DeleteUserDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.deleteUser(id);
  }

  /**
   * 7) Update user status
   *    E.g. to set from PENDING_ACTIVATION -> ACTIVE, or ACTIVE -> INACTIVE
   *    Admin only in this example.
   */
  @Patch(':id/status')
  @UpdateUserStatusDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status: UserStatus,
    @CurrentUser() currentUser?: User,
  ) {
    if (!currentUser) {
      throw new BadRequestException(
        'No current user found in request context.',
      );
    }
    return this.usersService.updateUserStatus(id, status, currentUser);
  }

  /**
   * 8) Deactivate user
   *    A specialized route for quick "deactivation". Admin only.
   */
  @Patch(':id/deactivate')
  @DeactivateUserDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser?: User,
  ) {
    if (!currentUser) {
      throw new BadRequestException(
        'No current user found in request context.',
      );
    }
    return this.usersService.deactivateUser(id, currentUser);
  }

  /**
   * 9) Activate user
   *    For approving end users from PENDING_ACTIVATION -> ACTIVE
   *    Admin only.
   */
  @Patch(':id/activate')
  @ActivateUserDocs()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @ApiBearerAuth()
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser?: User,
  ) {
    if (!currentUser) {
      throw new BadRequestException(
        'No current user found in request context.',
      );
    }
    return this.usersService.activateUser(id, currentUser);
  }
}
