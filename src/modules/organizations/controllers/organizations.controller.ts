import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  UseFilters,
  UseInterceptors,
  ParseUUIDPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrganizationWithAdminDto } from '../dtos/create-organization-with-admin.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { CreateOrganizationUserDto } from '../dtos/create-organization-user.dto';
import { UpdateOrganizationUserDto } from '../dtos/update-organization-user.dto';
import { ReasonDto } from '../dtos/reason.dto';
import { SuspendOrganizationDto } from '../dtos/suspend-organization.dto';
import { ArchiveOrganizationDto } from '../dtos/archive-organization.dto';
import { Organization } from '../entities/organization.entity';
import { OrganizationUser } from '../entities/organization-user.entity';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { Roles } from '@common/decorators/roles.decorator';
import { OrganizationUserRole } from '../entities/organization-user-role.enum';
import { OrganizationStatus } from '../entities/organization-status.enum';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { UserRole } from '@modules/users/entities/user-role.enum';
import { OrganizationService } from '../services/organizations.service';
import { OrganizationUserService } from '../services/organization-users.service';

import { CreateOrganizationWithAdminDocs } from '../documentation/create-organization.dto.documentation';
import {
  ActivateOrganizationDocs,
  ArchiveOrganizationDocs,
  SuspendOrganizationDocs,
} from '../documentation/organization-operations.documentation';
import { UpdateOrganizationDocs } from '../documentation/update-organization.dto.documentation';
import {
  FindOrganizationByNameDocs,
  GetOrganizationByIdDocs,
  ListOrganizationsDocs,
} from '../documentation/organization-queries.documentation';
import {
  ActivateOrganizationUserDocs,
  CreateOrganizationUserDocs,
  DeactivateOrganizationUserDocs,
  FindOrganizationUserByEmailDocs,
  FindOrganizationUserByIdDocs,
  ListOrganizationUsersDocs,
  LockOrganizationUserAccountDocs,
  SearchOrganizationUsersDocs,
  UnlockOrganizationUserAccountDocs,
  UpdateOrganizationUserDocs,
  UpdateOrganizationUserRoleDocs,
} from '../documentation/organization-user.documentation';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

@ApiTags('Organizations')
@Controller({ path: 'organizations', version: '1' })
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(TransformInterceptor)
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationUserService: OrganizationUserService,
  ) {}

  /**
   * Creates a new organization along with an initial admin user.
   * Access: System Admin
   */
  @Post('with-admin')
  @HttpCode(HttpStatus.CREATED)
  @CreateOrganizationWithAdminDocs()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createOrganizationWithAdmin(
    @Body() createOrganizationWithAdminDto: CreateOrganizationWithAdminDto,
    @CurrentUser() currentUser: User,
  ): Promise<Organization> {
    return this.organizationService.createOrganizationWithAdmin(
      createOrganizationWithAdminDto,
      currentUser.id,
    );
  }

  /**
   * Activates a pending organization and its admin users.
   * Access: System Admin
   */
  @Patch(':id/activate')
  @ActivateOrganizationDocs()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async activateOrganization(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Body() reasonDto: ReasonDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.organizationService.activateOrganization(
      organizationId,
      currentUser.id,
      reasonDto.reason,
    );
  }

  /**
   * Suspends an active organization and deactivates all its users.
   * Access: System Admin
   */
  @Patch(':id/suspend')
  @SuspendOrganizationDocs()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async suspendOrganization(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Body() suspendDto: SuspendOrganizationDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.organizationService.suspendOrganization(
      organizationId,
      currentUser.id,
      suspendDto.reason,
    );
  }

  /**
   * Archives an organization, setting its status to ARCHIVED.
   * Access: System Admin
   */
  @Patch(':id/archive')
  @ArchiveOrganizationDocs()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async archiveOrganization(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Body() archiveDto: ArchiveOrganizationDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.organizationService.archiveOrganization(
      organizationId,
      currentUser.id,
      archiveDto.reason,
    );
  }

  /**
   * Updates organization details.
   * Access: Organization Admin / System Admin
   */
  @Put(':id')
  @UpdateOrganizationDocs()
  // @UseGuards(JwtAuthGuard)
  async updateOrganization(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() currentUser: User,
  ): Promise<Organization> {
    return this.organizationService.updateOrganization(
      organizationId,
      updateOrganizationDto,
      currentUser.id,
    );
  }

  /**
   * Retrieves organization details by ID.
   * Access: Organization Users / System Admin
   */
  @Get(':id')
  @GetOrganizationByIdDocs()
  // @UseGuards(JwtAuthGuard)
  async findOrganizationById(
    @Param('id', ParseUUIDPipe) organizationId: string,
  ): Promise<Organization> {
    return this.organizationService.findOrganizationById(organizationId);
  }

  /**
   * Lists organizations with pagination and optional filters.
   * Access: System Admin
   */
  @Get() // Add this decorator
  @ListOrganizationsDocs()
  // @UseGuards(JwtAuthGuard)
  async listOrganizations(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('status') status?: OrganizationStatus,
    @Query('industry') industry?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<PaginationResult<Organization>> {
    const whereOptions: FindOptionsWhere<Organization> = {};

    if (status) {
      whereOptions.status = status;
    }
    if (industry) {
      whereOptions.industry = industry;
    }

    const orderOptions: FindOptionsOrder<Organization> = {};

    if (sortBy) {
      type SortableOrganizationFields = 'name' | 'industry' | 'status';
      const sortableFields: SortableOrganizationFields[] = [
        'name',
        'industry',
        'status',
      ];

      if (sortableFields.includes(sortBy as SortableOrganizationFields)) {
        orderOptions[sortBy as SortableOrganizationFields] = sortOrder;
      } else {
        throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
      }
    }

    const paginationOptions: PaginationOptions<Organization> = {
      page,
      limit,
      options: {
        where: whereOptions,
        order: orderOptions,
      },
      search,
    };

    return this.organizationService.listOrganizations(paginationOptions);
  }

  /**
   * Finds an organization by its exact name.
   * Access: Public
   */
  @Get('name/:name')
  @FindOrganizationByNameDocs()
  async findByName(@Param('name') name: string): Promise<Organization> {
    return this.organizationService.findByName(name);
  }

  // Organization User Management

  /**
   * Creates a new user within an organization.
   * Access: Organization Admin
   */
  @Post(':organizationId/users')
  @HttpCode(HttpStatus.CREATED)
  @CreateOrganizationUserDocs()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createOrganizationUser(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() createOrganizationUserDto: CreateOrganizationUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<OrganizationUser> {
    return this.organizationUserService.createOrganizationUser(
      organizationId,
      createOrganizationUserDto,
      currentUser.id,
    );
  }

  /**
   * Updates an existing organization user.
   * Access: Organization Admin / Self
   */
  @Put(':organizationId/users/:userId')
  @UpdateOrganizationUserDocs()
  // @UseGuards(JwtAuthGuard)
  async updateOrganizationUser(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateOrganizationUserDto: UpdateOrganizationUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<OrganizationUser> {
    return this.organizationUserService.updateOrganizationUser(
      userId,
      updateOrganizationUserDto,
      currentUser.id,
    );
  }

  /**
   * Lists users within an organization with pagination.
   * Access: Organization Admin
   */
  @Get(':organizationId/users')
  @ListOrganizationUsersDocs()
  // @UseGuards(JwtAuthGuard)
  async listOrganizationUsers(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('role') role?: OrganizationUserRole,
    @Query('isActive') isActive?: boolean,
    @Query('department') department?: string,
  ): Promise<PaginationResult<OrganizationUser>> {
    // Initialize whereOptions as a non-optional object
    const whereOptions: FindOptionsWhere<OrganizationUser> = { organizationId };

    // Conditionally add filters
    if (role) {
      whereOptions.role = role;
    }
    if (isActive !== undefined) {
      whereOptions.isActive = isActive;
    }
    if (department) {
      whereOptions.department = department;
    }

    // Define pagination options with initialized where
    const paginationOptions: PaginationOptions<OrganizationUser> = {
      page,
      limit,
      options: {
        where: whereOptions,
      },
    };

    return this.organizationUserService.listOrganizationUsers(
      organizationId,
      paginationOptions,
    );
  }

  /**
   * Searches for users within an organization.
   * Access: Organization Admin
   */
  @Get(':organizationId/users/search')
  @SearchOrganizationUsersDocs()
  // @UseGuards(JwtAuthGuard)
  async searchOrganizationUsers(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('search') search: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PaginationResult<OrganizationUser>> {
    const paginationOptions: PaginationOptions<OrganizationUser> = {
      page,
      limit,
      options: {
        where: { organizationId },
      },
    };

    return this.organizationUserService.searchOrganizationUsers(
      organizationId,
      search,
      paginationOptions,
    );
  }

  @Patch(':organizationId/users/:userId/activate')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ActivateOrganizationUserDocs()
  async activateOrganizationUser(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.organizationUserService.activateOrganizationUser(
      userId,
      currentUser.id,
    );
  }

  @Patch(':organizationId/users/:userId/deactivate')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @DeactivateOrganizationUserDocs()
  async deactivateOrganizationUser(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() reasonDto: ReasonDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.organizationUserService.deactivateOrganizationUser(
      userId,
      currentUser.id,
      reasonDto.reason,
    );
  }

  @Patch(':organizationId/users/:userId/role')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UpdateOrganizationUserRoleDocs()
  async updateOrganizationUserRole(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('role') role: OrganizationUserRole,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.organizationUserService.updateOrganizationUserRole(
      userId,
      role,
      currentUser.id,
    );
  }

  @Patch(':organizationId/users/:userId/lock')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @LockOrganizationUserAccountDocs()
  async lockOrganizationUserAccount(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.organizationUserService.lockOrganizationUserAccount(userId);
  }

  @Patch(':organizationId/users/:userId/unlock')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UnlockOrganizationUserAccountDocs()
  async unlockOrganizationUserAccount(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.organizationUserService.unlockOrganizationUserAccount(
      userId,
      currentUser.id,
    );
  }

  @Get(':organizationId/users/:userId')
  // @UseGuards(JwtAuthGuard)
  @FindOrganizationUserByIdDocs()
  async findOrganizationUserById(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<OrganizationUser> {
    return this.organizationUserService.findOrganizationUserById(userId);
  }

  @Get(':organizationId/users/email/:email')
  // @UseGuards(JwtAuthGuard)
  @FindOrganizationUserByEmailDocs()
  async findOrganizationUserByEmail(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('email') email: string,
  ): Promise<OrganizationUser> {
    return this.organizationUserService.findOrganizationUserByEmail(
      organizationId,
      email,
    );
  }
}
