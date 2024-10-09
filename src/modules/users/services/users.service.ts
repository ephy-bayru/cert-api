import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersRepository } from '../repository/users-repository';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserMapper } from '../dtos/user.mapper';
import { ConfigService } from '@nestjs/config';
import { ProviderType } from '../enums/provider-types';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { UserStatus } from '../entities/user-status.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly userMapper: UserMapper,
  ) {}

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      this.logger.warn('No user found with email', 'UsersService', {
        email,
      });
      throw new NotFoundException(`No user found with email ${email}`);
    }
    this.logger.log('User found by email', 'UsersService', { email });
    return this.userMapper.toResponseDto(user);
  }

  async findOneById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.getUserById(id);
    this.logger.log('User found by ID', 'UsersService', { userId: id });
    return this.userMapper.toResponseDto(user);
  }

  async findAllPaginated(
    paginationOptions: PaginationOptions<User>,
  ): Promise<PaginationResult<UserResponseDto>> {
    const result = await this.usersRepository.getUsers(paginationOptions);
    const data = result.data.map((user) => this.userMapper.toResponseDto(user));
    this.logger.log('Retrieved paginated users', 'UsersService', {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
    return {
      ...result,
      data,
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      await this.checkUniqueFields(createUserDto);

      if (createUserDto.provider === ProviderType.Local) {
        if (!createUserDto.password) {
          throw new ConflictException(
            'Password is required for local accounts.',
          );
        }
        createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      } else {
        createUserDto.password = await bcrypt.hash(
          this.configService.get(
            'OAUTH_PLACEHOLDER_PASSWORD',
            'defaultPassword',
          ),
          10,
        );
      }

      createUserDto.status =
        createUserDto.status || UserStatus.PENDING_ACTIVATION;

      const newUser = await this.usersRepository.createUser(createUserDto);
      this.logger.log('User created successfully', 'UsersService', {
        userId: newUser.id,
      });
      return this.userMapper.toResponseDto(newUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Failed to create user', 'UsersService', {
        error,
        createUserDto,
      });
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<UserResponseDto> {
    try {
      const existingUser = await this.usersRepository.getUserById(id);

      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        await this.checkEmailUniqueness(updateUserDto.email);
      }

      if (
        updateUserDto.userName &&
        updateUserDto.userName !== existingUser.userName
      ) {
        await this.checkUserNameUniqueness(updateUserDto.userName);
      }

      if (updateUserDto.fcn && updateUserDto.fcn !== existingUser.fcn) {
        await this.checkFcnUniqueness(updateUserDto.fcn);
      }

      if (updateUserDto.fin && updateUserDto.fin !== existingUser.fin) {
        await this.checkFinUniqueness(updateUserDto.fin);
      }

      if (updateUserDto.hasOwnProperty('provider')) {
        throw new ConflictException('Cannot change authentication provider');
      }

      if (updateUserDto.status && currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can change user status');
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updateData: Partial<User> = {
        ...updateUserDto,
        address: updateUserDto.address
          ? {
              ...updateUserDto.address,
              id: existingUser.id,
              user: existingUser.address?.user,
              organization: existingUser.address?.organization,
            }
          : undefined,
      };

      const updatedUser = await this.usersRepository.updateUser(id, updateData);
      this.logger.log('User updated successfully', 'UsersService', {
        userId: id,
      });
      return this.userMapper.toResponseDto(updatedUser);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Error updating user', 'UsersService', {
        userId: id,
        error,
      });
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.deleteUser(id);
    this.logger.log('User marked as deleted', 'UsersService', {
      userId: id,
    });
  }

  async updateUserStatus(
    id: string,
    status: UserStatus,
    currentUser: User,
  ): Promise<UserResponseDto> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change user status');
    }

    const user = await this.usersRepository.getUserById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.status === status) {
      throw new ConflictException(`User is already in ${status} status`);
    }

    await this.usersRepository.updateUserStatus(id, status);
    const updatedUser = await this.usersRepository.getUserById(id);
    this.logger.log('User status updated', 'UsersService', {
      userId: id,
      newStatus: status,
    });
    return this.userMapper.toResponseDto(updatedUser);
  }

  async activateUser(id: string, currentUser: User): Promise<UserResponseDto> {
    return this.updateUserStatus(id, UserStatus.ACTIVE, currentUser);
  }

  async deactivateUser(
    id: string,
    currentUser: User,
  ): Promise<UserResponseDto> {
    return this.updateUserStatus(id, UserStatus.DEACTIVATED, currentUser);
  }

  async searchUsers(
    query: string,
    paginationOptions: PaginationOptions<User>,
  ): Promise<PaginationResult<UserResponseDto>> {
    const paginationResult = await this.usersRepository.searchUsers(
      query,
      paginationOptions,
    );
    const data = paginationResult.data.map((user) =>
      this.userMapper.toResponseDto(user),
    );

    this.logger.log('Users search completed', 'UsersService', {
      query,
      page: paginationResult.page,
      limit: paginationResult.limit,
      total: paginationResult.total,
    });

    return {
      ...paginationResult,
      data,
    };
  }

  async isEmailUnique(email: string): Promise<boolean> {
    return !(await this.usersRepository.emailExists(email));
  }

  async isUserNameUnique(userName: string): Promise<boolean> {
    return !(await this.usersRepository.userNameExists(userName));
  }

  async isFcnUnique(fcn: string): Promise<boolean> {
    return !(await this.usersRepository.fcnExists(fcn));
  }

  async isFinUnique(fin: string): Promise<boolean> {
    return !(await this.usersRepository.finExists(fin));
  }

  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.usersRepository.incrementFailedLoginAttempts(id);
    this.logger.log('Incremented failed login attempts', 'UsersService', {
      userId: id,
    });
  }

  private async checkUniqueFields(
    userData: CreateUserDto | UpdateUserDto,
  ): Promise<void> {
    const uniqueFields: (keyof (CreateUserDto | UpdateUserDto))[] = [
      'email',
      'userName',
      'fcn',
      'fin',
    ];
    const existingFields: string[] = [];

    for (const field of uniqueFields) {
      if (userData[field]) {
        let isUnique: boolean;
        switch (field) {
          case 'email':
            isUnique = await this.isEmailUnique(userData.email);
            break;
          case 'userName':
            isUnique = await this.isUserNameUnique(userData.userName);
            break;
          case 'fcn':
            isUnique = await this.isFcnUnique(userData.fcn);
            break;
          case 'fin':
            isUnique = await this.isFinUnique(userData.fin);
            break;
        }
        if (!isUnique) {
          existingFields.push(field);
        }
      }
    }

    if (existingFields.length > 0) {
      throw new ConflictException(
        `The following fields already exist: ${existingFields.join(', ')}`,
      );
    }
  }

  private async checkEmailUniqueness(email: string): Promise<void> {
    if (!(await this.isEmailUnique(email))) {
      throw new ConflictException('Email already in use');
    }
  }

  private async checkUserNameUniqueness(userName: string): Promise<void> {
    if (!(await this.isUserNameUnique(userName))) {
      throw new ConflictException('Username already in use');
    }
  }

  private async checkFcnUniqueness(fcn: string): Promise<void> {
    if (!(await this.isFcnUnique(fcn))) {
      throw new ConflictException('FCN already in use');
    }
  }

  private async checkFinUniqueness(fin: string): Promise<void> {
    if (!(await this.isFinUnique(fin))) {
      throw new ConflictException('FIN already in use');
    }
  }
}
