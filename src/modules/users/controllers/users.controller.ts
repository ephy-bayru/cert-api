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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationOptions } from 'src/common/interfaces/IPagination';
import { UserStatus } from '../entities/user-status.entity';
import { User } from '../entities/user.entity';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '../entities/user-role.entity';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(TransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  @FindOneByIdDocs()
  async findOneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneById(id);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  @FindAllPaginatedDocs()
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

  @Post()
  @CreateUserDocs()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body(UniqueUserValidationPipe) createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard)
  @UpdateUserDocs()
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.updateUser(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  @DeleteUserDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.deleteUser(id);
  }

  @Patch(':id/status')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  @UpdateUserStatusDocs()
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status: UserStatus,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.updateUserStatus(id, status, currentUser);
  }

  @Patch(':id/deactivate')
  // @UseGuards(JwtAuthGuard)
  @DeactivateUserDocs()
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.deactivateUser(id, currentUser);
  }

  @Patch(':id/activate')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ActivateUserDocs()
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.activateUser(id, currentUser);
  }

  @Get('search')
  // @UseGuards(JwtAuthGuard)
  @SearchUsersDocs()
  async searchUsers(
    @Query('query') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const paginationOptions: PaginationOptions<User> = { page, limit };
    return this.usersService.searchUsers(query, paginationOptions);
  }
}
