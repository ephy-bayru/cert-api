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
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { AdminUsersService } from '../services/admin-users.service';
import { UserManagementService } from '../services/user-management.service';
import { OrganizationManagementService } from '../services/organization-management.service';

import { CreateAdminUserDto } from '../dtos/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dtos/update-admin-user.dto';
import { AdminUserResponseDto } from '../dtos/admin-user-response.dto';

import { CreateOrganizationDto } from '@modules/organizations/dtos/create-organization.dto';
import { UpdateOrganizationDto } from '@modules/organizations/dtos/update-organization.dto';
import { OrganizationResponseDto } from '@modules/organizations/dtos/organization-response.dto';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { OrganizationStatus } from '@modules/organizations/entities/organization-status.enum';

import { CreateUserDto } from '@modules/users/dtos/create-user.dto';
import { UpdateUserDto } from '@modules/users/dtos/update-user.dto';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { User } from '@modules/users/entities/user.entity';
import { UserStatus } from '@modules/users/entities/user-status.enum';

import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { GlobalRole } from '@common/enums/global-role.enum';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

import { FindOptionsWhere, ILike } from 'typeorm';

// Swagger documentation decorators
import {
  ListAdminUsersDocs,
  CreateAdminUserDocs,
  UpdateAdminUserDocs,
  DeleteAdminUserDocs,
  ActivateAdminUserDocs,
  DeactivateAdminUserDocs,
  LockAdminUserAccountDocs,
  UnlockAdminUserAccountDocs,
  FindOrganizationByIdDocs,
  ListOrganizationsDocs,
  CreateOrganizationDocs,
  UpdateOrganizationDocs,
  DeleteOrganizationDocs,
  ApproveOrganizationDocs,
  SuspendOrganizationDocs,
  ArchiveOrganizationDocs,
  FindUserByIdDocs,
  ListUsersDocs,
  CreateUserDocs,
  UpdateUserDocs,
  DeleteUserDocs,
  ActivateUserDocs,
  DeactivateUserDocs,
  LockUserAccountDocs,
  UnlockUserAccountDocs,
} from '../documentation/admin-users.controller.documentation';
import { AdminUser } from '../entities/admin-user.entity';

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(TransformInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GlobalRole.PLATFORM_ADMIN) // Class-level role requirement
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly userManagementService: UserManagementService,
    private readonly organizationManagementService: OrganizationManagementService,
  ) {}

  // ------------------------------------------------------------------------
  // Admin User Management
  // ------------------------------------------------------------------------

  @Get('admin-users')
  @ListAdminUsersDocs()
  async listAdminUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<PaginationResult<AdminUserResponseDto>> {
    const whereOptions: FindOptionsWhere<User> = {};

    // Example: searching by firstName; you can expand to lastName, email, etc.
    if (search) {
      whereOptions['firstName'] = ILike(`%${search}%`);
    }

    const paginationOptions: PaginationOptions<AdminUser> = {
      page,
      limit,
      options: {
        where: whereOptions,
      },
    };

    return this.adminUsersService.listAdminUsers(paginationOptions);
  }

  @Post('admin-users')
  @CreateAdminUserDocs()
  @HttpCode(HttpStatus.CREATED)
  async createAdminUser(
    @Body() createAdminUserDto: CreateAdminUserDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<AdminUserResponseDto> {
    const createdById = currentUser.id;
    return this.adminUsersService.createAdminUser(
      createAdminUserDto,
      createdById,
    );
  }

  @Put('admin-users/:id')
  @UpdateAdminUserDocs()
  async updateAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<AdminUserResponseDto> {
    const updatedById = currentUser.id;
    return this.adminUsersService.updateAdminUser(
      id,
      updateAdminUserDto,
      updatedById,
    );
  }

  @Delete('admin-users/:id')
  @DeleteAdminUserDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const deletedById = currentUser.id;
    await this.adminUsersService.deleteAdminUser(id, deletedById);
  }

  @Patch('admin-users/:id/activate')
  @ActivateAdminUserDocs()
  async activateAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const activatedById = currentUser.id;
    await this.adminUsersService.activateAdminUser(id, activatedById);
  }

  @Patch('admin-users/:id/deactivate')
  @DeactivateAdminUserDocs()
  async deactivateAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const deactivatedById = currentUser.id;
    await this.adminUsersService.deactivateAdminUser(id, deactivatedById);
  }

  @Patch('admin-users/:id/lock')
  @LockAdminUserAccountDocs()
  async lockAdminUserAccount(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.adminUsersService.lockAdminUserAccount(id);
  }

  @Patch('admin-users/:id/unlock')
  @UnlockAdminUserAccountDocs()
  async unlockAdminUserAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const unlockedById = currentUser.id;
    await this.adminUsersService.unlockAdminUserAccount(id, unlockedById);
  }

  // ------------------------------------------------------------------------
  // Organization Management
  // ------------------------------------------------------------------------

  @Get('organizations/:id')
  @FindOrganizationByIdDocs()
  async findOrganizationById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationManagementService.findOrganizationById(id);
  }

  @Get('organizations')
  @ListOrganizationsDocs()
  async listOrganizations(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: OrganizationStatus,
    @Query('industry') industry?: string,
    @Query('search') search?: string,
  ): Promise<PaginationResult<OrganizationResponseDto>> {
    const whereOptions: FindOptionsWhere<Organization> = {};

    if (status) whereOptions.status = status;
    if (industry) whereOptions.industry = industry;
    if (search) {
      whereOptions.name = ILike(`%${search}%`);
    }

    const paginationOptions: PaginationOptions<Organization> = {
      page,
      limit,
      options: { where: whereOptions },
    };

    return this.organizationManagementService.listOrganizations(
      paginationOptions,
    );
  }

  @Post('organizations')
  @CreateOrganizationDocs()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<OrganizationResponseDto> {
    const createdById = currentUser.id;
    return this.organizationManagementService.createOrganization(
      createOrganizationDto,
      createdById,
    );
  }

  @Put('organizations/:id')
  @UpdateOrganizationDocs()
  async updateOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<OrganizationResponseDto> {
    const updatedById = currentUser.id;
    return this.organizationManagementService.updateOrganization(
      id,
      updateOrganizationDto,
      updatedById,
    );
  }

  @Delete('organizations/:id')
  @DeleteOrganizationDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    await this.organizationManagementService.archiveOrganization(
      id,
      currentUser.id,
    );
  }

  @Patch('organizations/:id/approve')
  @ApproveOrganizationDocs()
  async approveOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const approvedById = currentUser.id;
    await this.organizationManagementService.approveOrganization(
      id,
      approvedById,
    );
  }

  @Patch('organizations/:id/suspend')
  @SuspendOrganizationDocs()
  async suspendOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const suspendedById = currentUser.id;
    await this.organizationManagementService.suspendOrganization(
      id,
      reason,
      suspendedById,
    );
  }

  @Patch('organizations/:id/archive')
  @ArchiveOrganizationDocs()
  async archiveOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const archivedById = currentUser.id;
    await this.organizationManagementService.archiveOrganization(
      id,
      archivedById,
    );
  }

  // ------------------------------------------------------------------------
  // User Management
  // ------------------------------------------------------------------------

  @Get('users/:id')
  @FindUserByIdDocs()
  async findUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.userManagementService.findUserById(id);
  }

  @Get('users')
  @ListUsersDocs()
  async listUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: UserStatus,
    @Query('search') search?: string,
  ): Promise<PaginationResult<UserResponseDto>> {
    const whereOptions: FindOptionsWhere<User> = {};

    if (status) whereOptions.status = status;
    if (search) {
      whereOptions.email = ILike(`%${search}%`);
    }

    const paginationOptions: PaginationOptions<User> = {
      page,
      limit,
      options: { where: whereOptions },
    };

    return this.userManagementService.listUsers(paginationOptions);
  }

  @Post('users')
  @CreateUserDocs()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<UserResponseDto> {
    const createdById = currentUser.id;
    return this.userManagementService.createUser(createUserDto, createdById);
  }

  @Put('users/:id')
  @UpdateUserDocs()
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<UserResponseDto> {
    const updatedById = currentUser.id;
    return this.userManagementService.updateUser(
      id,
      updateUserDto,
      updatedById,
    );
  }

  @Delete('users/:id')
  @DeleteUserDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    await this.userManagementService.deactivateUser(id, currentUser.id);
  }

  @Patch('users/:id/activate')
  @ActivateUserDocs()
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    await this.userManagementService.activateUser(id, currentUser.id);
  }

  @Patch('users/:id/deactivate')
  @DeactivateUserDocs()
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    await this.userManagementService.deactivateUser(id, currentUser.id);
  }

  @Patch('users/:id/lock')
  @LockUserAccountDocs()
  async lockUserAccount(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userManagementService.lockUserAccount(id);
  }

  @Patch('users/:id/unlock')
  @UnlockUserAccountDocs()
  async unlockUserAccount(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.userManagementService.unlockUserAccount(id);
  }
}
