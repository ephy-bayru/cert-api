import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from '../repository/users-repository';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserMapper } from '../dtos/user.mapper';
import { ConfigService } from '@nestjs/config';
import { ProviderType } from '../enums/provider-types';
import { User } from '../entities/user.entity';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { UserStatus } from '../entities/user-status.entity';
import { Address } from '../entities/address.entity';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly userMapper: UserMapper,
  ) {}

  /**
   * Finds a user by email.
   */
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

  /**
   * Finds a user by ID.
   */
  async findOneById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.getUserById(id);
    this.logger.log('User found by ID', 'UsersService', { userId: id });
    return this.userMapper.toResponseDto(user);
  }

  /**
   * Retrieves paginated users.
   */
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

  /**
   * Creates a new user with default role and status.
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      await this.checkUniqueFields(createUserDto);

      if (!createUserDto.password) {
        throw new BadRequestException('Password is required.');
      }
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

      // Force set role and status
      const userEntity = this.usersRepository.create({
        ...createUserDto,
        role: UserRole.USER,
        status: UserStatus.PENDING_ACTIVATION,
      });

      const newUser = await this.usersRepository.save(userEntity);

      this.logger.log('User created successfully', 'UsersService', {
        userId: newUser.id,
      });
      return this.userMapper.toResponseDto(newUser);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Failed to create user', 'UsersService', {
        error,
        createUserDto,
      });
      throw new InternalServerErrorException('Error creating user');
    }
  }

  /**
   * Updates user information.
   * Non-admin users cannot change role or status.
   */
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<UserResponseDto> {
    try {
      const existingUser = await this.usersRepository.getUserById(id);

      await this.validateUniqueFields(updateUserDto, existingUser);

      // Prevent non-admin users from changing role or status
      if (
        (updateUserDto.role || updateUserDto.status) &&
        currentUser.role !== UserRole.ADMIN
      ) {
        throw new ForbiddenException('Only admins can change role or status');
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Handle address update if provided
      if (updateUserDto.address) {
        if (existingUser.address) {
          Object.assign(existingUser.address, updateUserDto.address);
        } else {
          existingUser.address = Object.assign(
            new Address(),
            updateUserDto.address,
          );
        }
      }

      // Update user fields
      Object.assign(existingUser, updateUserDto);

      const updatedUser = await this.usersRepository.save(existingUser);

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

  /**
   * Marks a user as deleted.
   */
  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.deleteUser(id);
    this.logger.log('User marked as deleted', 'UsersService', {
      userId: id,
    });
  }

  /**
   * Updates the user's status. Only admins can perform this action.
   */
  async updateUserStatus(
    id: string,
    status: UserStatus,
    currentUser: User,
  ): Promise<UserResponseDto> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change user status');
    }

    const user = await this.usersRepository.getUserById(id);

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

  /**
   * Activates a user account. Only admins can perform this action.
   */
  async activateUser(id: string, currentUser: User): Promise<UserResponseDto> {
    return this.updateUserStatus(id, UserStatus.ACTIVE, currentUser);
  }

  /**
   * Deactivates a user account. Only admins can perform this action.
   */
  async deactivateUser(
    id: string,
    currentUser: User,
  ): Promise<UserResponseDto> {
    return this.updateUserStatus(id, UserStatus.DEACTIVATED, currentUser);
  }

  /**
   * Searches for users based on a query string.
   */
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

  /**
   * Checks if an email is unique.
   */
  async isEmailUnique(email: string): Promise<boolean> {
    return !(await this.usersRepository.emailExists(email));
  }

  /**
   * Checks if a username is unique.
   */
  async isUserNameUnique(userName: string): Promise<boolean> {
    return !(await this.usersRepository.userNameExists(userName));
  }

  /**
   * Checks if an FCN is unique.
   */
  async isFcnUnique(fcn: string): Promise<boolean> {
    return !(await this.usersRepository.fcnExists(fcn));
  }

  /**
   * Checks if a FIN is unique.
   */
  async isFinUnique(fin: string): Promise<boolean> {
    return !(await this.usersRepository.finExists(fin));
  }

  /**
   * Increments failed login attempts.
   */
  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.usersRepository.incrementFailedLoginAttempts(id);
    this.logger.log('Incremented failed login attempts', 'UsersService', {
      userId: id,
    });
  }

  /**
   * Checks unique fields during user creation or update.
   */
  private async checkUniqueFields(
    userData: CreateUserDto | UpdateUserDto,
  ): Promise<void> {
    const uniqueFields: Array<'email' | 'userName' | 'fcn' | 'fin'> = [
      'email',
      'userName',
      'fcn',
      'fin',
    ];
    const existingFields: string[] = [];

    for (const field of uniqueFields) {
      const value = userData[field];
      if (typeof value === 'string' && value) {
        let isUnique: boolean;
        switch (field) {
          case 'email':
            isUnique = await this.isEmailUnique(value);
            break;
          case 'userName':
            isUnique = await this.isUserNameUnique(value);
            break;
          case 'fcn':
            isUnique = await this.isFcnUnique(value);
            break;
          case 'fin':
            isUnique = await this.isFinUnique(value);
            break;
          default:
            isUnique = true;
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

  /**
   * Validates unique fields during user update.
   */
  private async validateUniqueFields(
    updateUserDto: UpdateUserDto,
    existingUser: User,
  ): Promise<void> {
    const uniqueFields: Array<'email' | 'userName' | 'fcn' | 'fin'> = [
      'email',
      'userName',
      'fcn',
      'fin',
    ];
    const existingFields: string[] = [];

    for (const field of uniqueFields) {
      const newValue = updateUserDto[field];
      const existingValue = existingUser[field];
      if (
        typeof newValue === 'string' &&
        newValue &&
        newValue !== existingValue
      ) {
        let isUnique: boolean;
        switch (field) {
          case 'email':
            isUnique = await this.isEmailUnique(newValue);
            break;
          case 'userName':
            isUnique = await this.isUserNameUnique(newValue);
            break;
          case 'fcn':
            isUnique = await this.isFcnUnique(newValue);
            break;
          case 'fin':
            isUnique = await this.isFinUnique(newValue);
            break;
          default:
            isUnique = true;
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
}
