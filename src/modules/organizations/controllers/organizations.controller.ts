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
  UseFilters,
  UseInterceptors,
  ParseUUIDPipe,
  ParseIntPipe,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  DefaultValuePipe,
  UseGuards,
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
import { OrganizationResponseDto } from '../dtos/organization-response.dto';

import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { Roles } from '@common/decorators/roles.decorator';
import { OrganizationStatus } from '../entities/organization-status.enum';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { GlobalRole } from '@common/enums/global-role.enum';
import { User } from '@modules/users/entities/user.entity';

import { OrganizationService } from '../services/organizations.service';
import { OrganizationUserService } from '../services/organization-users.service';

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
  UpdateOrganizationUserRolesDocs,
} from '../documentation/organization-user.documentation';

import { ArrayContains, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { LoggerService } from '@common/services/logger.service';
import { UpdateUserRolesDto } from '../dtos/update-user-roles.dto';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@ApiTags('Organizations')
@Controller({ path: 'organizations', version: '1' })
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(TransformInterceptor)
@Roles(
  GlobalRole.ORG_ADMIN,
  GlobalRole.ORG_SUPER_ADMIN,
  GlobalRole.PLATFORM_ADMIN,
  GlobalRole.PLATFORM_SUPER_ADMIN,
)
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationUserService: OrganizationUserService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Creates a new organization along with an initial admin user.
   * Access: System Admin or other authorized roles, or possibly public if your app allows it.
   */
  @Post('with-admin')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  async createOrganizationWithAdmin(
    @Body() createOrganizationWithAdminDto: CreateOrganizationWithAdminDto,
    @CurrentUser() currentUser: User | null,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(
      `Received request to create organization: ${createOrganizationWithAdminDto.name}`,
      'OrganizationController',
    );

    // Decide how to handle creation if no user is logged in
    let createdById: string;
    if (currentUser?.id) {
      this.logger.log(
        `Authenticated admin user: ${currentUser.email} (ID: ${currentUser.id})`,
        'OrganizationController',
      );
      createdById = currentUser.id;
    } else {
      this.logger.warn(
        'No authenticated user found for organization creation; using fallback ID.',
        'OrganizationController',
      );
      // Fallback approach — can be replaced with an error if mandatory
      createdById = '6da8911c-f9aa-4943-a6c1-5db1474eae57';
    }

    try {
      const organization =
        await this.organizationService.createOrganizationWithAdmin(
          createOrganizationWithAdminDto,
          createdById,
        );

      if (!organization) {
        this.logger.error(
          'OrganizationService returned null/undefined organization.',
          'OrganizationController',
        );
        throw new InternalServerErrorException(
          'Failed to create organization; service returned no data.',
        );
      }

      this.logger.log(
        `Organization '${organization.name}' created with ID: ${organization.id}`,
        'OrganizationController',
      );
      return new OrganizationResponseDto(organization);
    } catch (error) {
      this.logger.error(
        'Error in createOrganizationWithAdmin',
        'OrganizationController',
        { error },
      );
      throw error;
    }
  }

  /**
   * Activates a pending organization and its admin users.
   * Access: System Admin (or a designated GlobalRole).
   */
  @Patch(':id/activate')
  @ActivateOrganizationDocs()
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activateOrganization(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Body() reasonDto: ReasonDto,
    @CurrentUser() currentUser: User,
  ): Promise<{
    statusCode: number;
    message: string;
    data: any;
    timestamp: string;
  }> {
    return this.organizationService.activateOrganization(
      organizationId,
      currentUser.id,
      reasonDto.reason,
    );
  }

  /**
   * Suspends an active organization and deactivates all its users.
   * Access: System Admin (or a designated GlobalRole).
   */
  @Patch(':id/suspend')
  @SuspendOrganizationDocs()
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async suspendOrganization(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Body() suspendDto: SuspendOrganizationDto,
    @CurrentUser() currentUser: User,
  ): Promise<{
    statusCode: number;
    message: string;
    data: any;
    timestamp: string;
  }> {
    return this.organizationService.suspendOrganization(
      organizationId,
      currentUser.id,
      suspendDto.reason,
    );
  }

  /**
   * Archives an organization, setting its status to ARCHIVED.
   * Access: System Admin (or a designated GlobalRole).
   */
  @Patch(':id/archive')
  @ArchiveOrganizationDocs()
  @Roles(GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async archiveOrganization(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Body() archiveDto: ArchiveOrganizationDto,
    @CurrentUser() currentUser: User,
  ): Promise<{
    statusCode: number;
    message: string;
    data: any;
    timestamp: string;
  }> {
    return this.organizationService.archiveOrganization(
      organizationId,
      currentUser.id,
      archiveDto.reason,
    );
  }

  /**
   * Updates organization details.
   * Access: Org Admin or System Admin roles.
   */
  @Put(':id')
  @UpdateOrganizationDocs()
  @Roles(GlobalRole.ORG_ADMIN, GlobalRole.ORG_SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
   * Access: Org users or System Admin roles (depending on your requirements).
   */
  @Get(':id')
  @GetOrganizationByIdDocs()
  async findOrganizationById(
    @Param('id', ParseUUIDPipe) organizationId: string,
  ): Promise<Organization> {
    return this.organizationService.findOrganizationById(organizationId);
  }

  /**
   * Lists organizations with pagination and optional filters.
   * Access: System Admin (or a designated GlobalRole).
   */
  @Get()
  @ListOrganizationsDocs()
  async listOrganizations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: OrganizationStatus,
    @Query('industry') industry?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<PaginationResult<Organization>> {
    const whereOptions: FindOptionsWhere<Organization> = {};
    if (status) whereOptions.status = status;
    if (industry) whereOptions.industry = industry;

    // Sorting logic
    const orderOptions: FindOptionsOrder<Organization> = {};
    if (sortBy) {
      type SortableFields = 'name' | 'industry' | 'status';
      const validSortFields: SortableFields[] = ['name', 'industry', 'status'];

      if (validSortFields.includes(sortBy as SortableFields)) {
        orderOptions[sortBy as SortableFields] = sortOrder;
      } else {
        throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
      }
    }

    const paginationOptions: PaginationOptions<Organization> = {
      page,
      limit,
      options: { where: whereOptions, order: orderOptions },
      search,
    };

    return this.organizationService.listOrganizations(paginationOptions);
  }

  /**
   * Finds an organization by its exact name.
   * Access: Public or restricted (depending on your business logic).
   */
  @Get('name/:name')
  @FindOrganizationByNameDocs()
  async findByName(@Param('name') name: string): Promise<Organization> {
    return this.organizationService.findByName(name);
  }

  // ------------------------------------------------------------------------
  // Organization User Management
  // ------------------------------------------------------------------------

  /**
   * Creates a new user within an organization.
   * Access: Organization Admin
   */
  @Post(':organizationId/users')
  @HttpCode(HttpStatus.CREATED)
  @CreateOrganizationUserDocs()
  @Roles(GlobalRole.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles(GlobalRole.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateOrganizationUser(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateDto: UpdateOrganizationUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<OrganizationUser> {
    if (
      currentUser.id !== userId &&
      !currentUser.roles.includes(GlobalRole.ORG_ADMIN)
    ) {
      throw new ForbiddenException('You are not allowed to update this user.');
    }
    return this.organizationUserService.updateOrganizationUser(
      userId,
      updateDto,
      currentUser.id,
    );
  }

  /**
   * Lists users within an organization, paginated.
   * Access: Organization Admin
   */
  @Get(':organizationId/users')
  @ListOrganizationUsersDocs()
  @Roles(GlobalRole.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async listOrganizationUsers(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role') role?: GlobalRole,
    @Query('isActive') isActive?: boolean,
    @Query('department') department?: string,
  ): Promise<PaginationResult<OrganizationUser>> {
    const whereOptions: FindOptionsWhere<OrganizationUser> = { organizationId };

    if (role) whereOptions.roles = ArrayContains([role]);
    if (isActive !== undefined) whereOptions.isActive = isActive;
    if (department) whereOptions.department = department;

    const paginationOptions: PaginationOptions<OrganizationUser> = {
      page,
      limit,
      options: { where: whereOptions },
    };

    return this.organizationUserService.listOrganizationUsers(
      organizationId,
      paginationOptions,
    );
  }

  /**
   * Searches organization users by name, email, username, etc.
   * Access: Organization Admin
   */
  @Get(':organizationId/users/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SearchOrganizationUsersDocs()
  async searchOrganizationUsers(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('search') search: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginationResult<OrganizationUser>> {
    const paginationOptions: PaginationOptions<OrganizationUser> = {
      page,
      limit,
      options: { where: { organizationId } },
    };

    return this.organizationUserService.searchOrganizationUsers(
      organizationId,
      search,
      paginationOptions,
    );
  }

  @Patch(':organizationId/users/:userId/activate')
  @Roles(GlobalRole.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ActivateOrganizationUserDocs()
  async activateOrganizationUser(
    @Param('organizationId', ParseUUIDPipe) orgId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    return this.organizationUserService.activateOrganizationUser(
      userId,
      currentUser.id,
    );
  }

  @Patch(':organizationId/users/:userId/deactivate')
  @Roles(GlobalRole.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @DeactivateOrganizationUserDocs()
  async deactivateOrganizationUser(
    @Param('organizationId', ParseUUIDPipe) orgId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() reasonDto: ReasonDto,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    return this.organizationUserService.deactivateOrganizationUser(
      userId,
      currentUser.id,
      reasonDto.reason,
    );
  }

  @Patch(':organizationId/users/:userId/roles')
  @Roles(GlobalRole.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UpdateOrganizationUserRolesDocs()
  async updateOrganizationUserRoles(
    @Param('organizationId', ParseUUIDPipe) orgId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
    @CurrentUser() currentUser: User,
  ): Promise<{ message: string }> {
    return this.organizationUserService.updateOrganizationUserRoles(
      userId,
      updateUserRolesDto.roles,
      currentUser.id,
    );
  }

  @Patch(':organizationId/users/:userId/lock')
  @Roles(GlobalRole.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @LockOrganizationUserAccountDocs()
  async lockOrganizationUserAccount(
    @Param('organizationId', ParseUUIDPipe) orgId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<{
    statusCode: number;
    message: string;
    data: any;
    timestamp: string;
  }> {
    return this.organizationUserService.lockOrganizationUserAccount(userId);
  }

  @Patch(':organizationId/users/:userId/unlock')
  @Roles(GlobalRole.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UnlockOrganizationUserAccountDocs()
  async unlockOrganizationUserAccount(
    @Param('organizationId', ParseUUIDPipe) orgId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() currentUser: User,
  ): Promise<{
    statusCode: number;
    message: string;
    data: any;
    timestamp: string;
  }> {
    return this.organizationUserService.unlockOrganizationUserAccount(
      userId,
      currentUser.id,
    );
  }

  @Get(':organizationId/users/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @FindOrganizationUserByIdDocs()
  async findOrganizationUserById(
    @Param('organizationId', ParseUUIDPipe) orgId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<OrganizationUser> {
    return this.organizationUserService.findOrganizationUserById(userId);
  }

  @Get(':organizationId/users/email/:email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @FindOrganizationUserByEmailDocs()
  async findOrganizationUserByEmail(
    @Param('organizationId', ParseUUIDPipe) orgId: string,
    @Param('email') email: string,
  ): Promise<OrganizationUser> {
    return this.organizationUserService.findOrganizationUserByEmail(
      orgId,
      email,
    );
  }
}
