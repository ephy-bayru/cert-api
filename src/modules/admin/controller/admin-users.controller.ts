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
} from '@nestjs/common';
import { AdminUsersService } from '../services/admin-users.service';
import { UserManagementService } from '../services/user-management.service';
import { OrganizationManagementService } from '../services/organization-management.service';
import { CreateAdminUserDto } from '../dtos/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dtos/update-admin-user.dto';
import { AdminUserResponseDto } from '../dtos/admin-user-response.dto';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminRole } from '../entities/admin-user.entity';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { OrganizationResponseDto } from '@modules/organizations/dtos/organization-response.dto';
import { OrganizationStatus } from '@modules/organizations/entities/organization-status.enum';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { CreateOrganizationDto } from '@modules/organizations/dtos/create-organization.dto';
import { UpdateOrganizationDto } from '@modules/organizations/dtos/update-organization.dto';
import { UserStatus } from '@modules/users/entities/user-status.entity';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { User } from '@modules/users/entities/user.entity';
import { CreateUserDto } from '@modules/users/dtos/create-user.dto';
import { UpdateUserDto } from '@modules/users/dtos/update-user.dto';
import { FindOptionsWhere, ILike } from 'typeorm';

@Controller('admin')
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(TransformInterceptor)
// @UseGuards(RolesGuard)
// @Roles(AdminRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly userManagementService: UserManagementService,
    private readonly organizationManagementService: OrganizationManagementService,
  ) {}

  // Admin User Management
  @Get('admin-users')
  async listAdminUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<PaginationResult<AdminUserResponseDto>> {
    const whereOptions: FindOptionsWhere<AdminUser> = {};

    if (search) {
      whereOptions.firstName = ILike(`%${search}%`);
      // If searching multiple fields:
      // whereOptions = [
      //   { name: ILike(`%${search}%`) },
      //   { email: ILike(`%${search}%`) },
      // ];
    }

    const paginationOptions: PaginationOptions<AdminUser> = {
      page,
      limit,
      options: {
        where: whereOptions,
      },
    };

    return await this.adminUsersService.listAdminUsers(paginationOptions);
  }

  @Post('admin-users')
  @HttpCode(HttpStatus.CREATED)
  async createAdminUser(
    @Body() createAdminUserDto: CreateAdminUserDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<AdminUserResponseDto> {
    const createdById = currentUser.id;
    return await this.adminUsersService.createAdminUser(
      createAdminUserDto,
      createdById,
    );
  }

  @Put('admin-users/:id')
  async updateAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<AdminUserResponseDto> {
    const updatedById = currentUser.id;
    return await this.adminUsersService.updateAdminUser(
      id,
      updateAdminUserDto,
      updatedById,
    );
  }

  @Delete('admin-users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const deletedById = currentUser.id;
    await this.adminUsersService.deleteAdminUser(id, deletedById);
  }

  @Patch('admin-users/:id/activate')
  async activateAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const activatedById = currentUser.id;
    await this.adminUsersService.activateAdminUser(id, activatedById);
  }

  @Patch('admin-users/:id/deactivate')
  async deactivateAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const deactivatedById = currentUser.id;
    await this.adminUsersService.deactivateAdminUser(id, deactivatedById);
  }

  @Patch('admin-users/:id/lock')
  async lockAdminUserAccount(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.adminUsersService.lockAdminUserAccount(id);
  }

  @Patch('admin-users/:id/unlock')
  async unlockAdminUserAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    const unlockedById = currentUser.id;
    await this.adminUsersService.unlockAdminUserAccount(id, unlockedById);
  }

  // Organization Management

  @Get('organizations/:id')
  async findOrganizationById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationResponseDto> {
    return await this.organizationManagementService.findOrganizationById(id);
  }

  @Get('organizations')
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
      options: {
        where: whereOptions,
      },
    };

    return await this.organizationManagementService.listOrganizations(
      paginationOptions,
    );
  }

  @Post('organizations')
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<OrganizationResponseDto> {
    const createdById = currentUser.id;
    return await this.organizationManagementService.createOrganization(
      createOrganizationDto,
      createdById,
    );
  }

  @Put('organizations/:id')
  async updateOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<OrganizationResponseDto> {
    const updatedById = currentUser.id;
    return await this.organizationManagementService.updateOrganization(
      id,
      updateOrganizationDto,
      updatedById,
    );
  }

  @Delete('organizations/:id')
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

  // User Management

  @Get('users/:id')
  async findUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return await this.userManagementService.findUserById(id);
  }

  @Get('users')
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
      options: {
        where: whereOptions,
      },
    };

    return await this.userManagementService.listUsers(paginationOptions);
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<UserResponseDto> {
    const createdById = currentUser.id;
    return await this.userManagementService.createUser(
      createUserDto,
      createdById,
    );
  }

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<UserResponseDto> {
    const updatedById = currentUser.id;
    return await this.userManagementService.updateUser(
      id,
      updateUserDto,
      updatedById,
    );
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    await this.userManagementService.deactivateUser(id, currentUser.id);
  }

  @Patch('users/:id/activate')
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    await this.userManagementService.activateUser(id, currentUser.id);
  }

  @Patch('users/:id/deactivate')
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AdminUser,
  ): Promise<void> {
    await this.userManagementService.deactivateUser(id, currentUser.id);
  }

  @Patch('users/:id/lock')
  async lockUserAccount(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userManagementService.lockUserAccount(id);
  }

  @Patch('users/:id/unlock')
  async unlockUserAccount(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.userManagementService.unlockUserAccount(id);
  }
}
