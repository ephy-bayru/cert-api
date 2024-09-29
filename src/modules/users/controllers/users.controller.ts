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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UniqueUserValidationPipe } from '../pipes/unique-user-validation.pipe';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import {
  FindOneByIdDocs,
  FindAllPaginatedDocs,
  CreateUserDocs,
  UpdateUserDocs,
  DeleteUserDocs,
  DeactivateUserDocs,
  SearchUsersDocs,
} from '../documentation/users.controller.documentation';
import { UserRole } from '../entities/user-role.entity';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
@UseFilters(HttpExceptionFilter)
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.findAllPaginated(page, limit);
  }

  @Post()
  // @UseGuards(JwtAuthGuard)
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
    @Req() req: any,
  ) {
    const currentUser = req.user;
    return this.usersService.updateUser(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  @DeleteUserDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.deleteUser(id);
  }

  @Put(':id/deactivate')
  // @UseGuards(JwtAuthGuard)
  @DeactivateUserDocs()
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.deactivateUser(id);
  }

  @Patch(':id/activate')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activateUser(id);
  }

  @Get('search')
  // @UseGuards(JwtAuthGuard)
  @SearchUsersDocs()
  async searchUsers(
    @Query('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.searchUsers(query, page, limit);
  }
}
