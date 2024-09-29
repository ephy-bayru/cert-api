import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from '../repository/users-repository';
import { LoggerService } from 'src/common/services/logger.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserMapper } from '../dtos/user.mapper';
import { ConfigService } from '@nestjs/config';
import { ProviderType } from '../enums/provider-types';
import { User, UserStatus } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private logger: LoggerService,
    private configService: ConfigService,
    private userMapper: UserMapper,
  ) {
    this.logger.setContext('UsersService');
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.findByEmail(email);
      if (!user) {
        this.logger.logWarn(`No user found with email ${email}`);
        throw new NotFoundException(`No user found with email ${email}`);
      }
      this.logger.logInfo('User found by email', { email });
      return this.userMapper.toResponseDto(user);
    } catch (error) {
      this.logger.logError('Failed to find user by email', { email, error });
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findOneById(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.getUserById(id);
      this.logger.logInfo('User found by ID', { userId: id });
      return this.userMapper.toResponseDto(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.logWarn(`User not found with ID: ${id}`);
        throw error;
      }
      this.logger.logError(`Failed to find user by ID: ${id}`, { error });
      throw new InternalServerErrorException('Failed to find user by ID');
    }
  }

  async findAllPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<UserResponseDto>> {
    try {
      const result = await this.usersRepository.getUsers(page, limit);

      const data = result.data.map((user) =>
        this.userMapper.toResponseDto(user),
      );

      this.logger.logInfo('Retrieved paginated users', {
        page,
        limit,
        total: result.total,
      });

      return {
        data,
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      this.logger.logError('Failed to retrieve paginated users', { error });
      throw new InternalServerErrorException('Failed to retrieve users.');
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const emailExists = await this.usersRepository.emailExists(
        createUserDto.email,
      );
      if (emailExists) {
        this.logger.logWarn(`Email already in use: ${createUserDto.email}`);
        throw new ConflictException(
          `Email already in use: ${createUserDto.email}`,
        );
      }

      const userNameExists = await this.usersRepository.userNameExists(
        createUserDto.userName,
      );
      if (userNameExists) {
        this.logger.logWarn(
          `Username already in use: ${createUserDto.userName}`,
        );
        throw new ConflictException(
          `Username already in use: ${createUserDto.userName}`,
        );
      }

      // Handle password based on provider
      if (createUserDto.provider === ProviderType.Local) {
        if (createUserDto.password) {
          createUserDto.password = await bcrypt.hash(
            createUserDto.password,
            10,
          );
        } else {
          throw new ConflictException(
            'Password is required for local accounts.',
          );
        }
      } else {
        // For OAuth providers, set a default password or handle accordingly
        createUserDto.password = await bcrypt.hash(
          this.configService.get(
            'OAUTH_PLACEHOLDER_PASSWORD',
            'defaultPassword',
          ),
          10,
        );
      }

      // Explicitly set status to DEACTIVATED
      createUserDto.status = UserStatus.DEACTIVATED;

      const newUser = await this.usersRepository.createUser(createUserDto);
      this.logger.logInfo('User created successfully', { userId: newUser.id });
      return this.userMapper.toResponseDto(newUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.logError('Failed to create user', { error, createUserDto });
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
        const emailExists = await this.usersRepository.emailExists(
          updateUserDto.email,
        );
        if (emailExists) {
          this.logger.logWarn(`Email already in use: ${updateUserDto.email}`);
          throw new ConflictException('Email already in use');
        }
      }

      if (
        updateUserDto.userName &&
        updateUserDto.userName !== existingUser.userName
      ) {
        const userNameExists = await this.usersRepository.userNameExists(
          updateUserDto.userName,
        );
        if (userNameExists) {
          this.logger.logWarn(
            `Username already in use: ${updateUserDto.userName}`,
          );
          throw new ConflictException('Username already in use');
        }
      }

      // Prevent changing the provider
      if (updateUserDto.hasOwnProperty('provider')) {
        this.logger.logWarn('Attempt to change provider is not allowed');
        throw new ConflictException('Cannot change authentication provider');
      }

      // Prevent non-admins from changing the status
      if (updateUserDto.status && currentUser.role !== UserRole.ADMIN) {
        this.logger.logWarn('Attempt to change status by non-admin user');
        throw new ForbiddenException('Only admins can change user status');
      }

      // Hash the password if it's being updated
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.usersRepository.updateUser(
        id,
        updateUserDto,
      );
      this.logger.logInfo('User updated successfully', { userId: id });
      return this.userMapper.toResponseDto(updatedUser);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.logError(`Error updating user with ID: ${id}`, { error });
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.usersRepository.deleteUser(id);
      this.logger.logInfo('User deleted successfully', { userId: id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.logError(`Error deleting user with ID: ${id}`, { error });
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  async deactivateUser(id: string): Promise<void> {
    try {
      await this.usersRepository.deactivateUser(id);
      this.logger.logInfo('User deactivated successfully', { userId: id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.logError(`Error deactivating user with ID: ${id}`, { error });
      throw new InternalServerErrorException('Error deactivating user');
    }
  }

  async activateUser(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.getUserById(id);

      if (user.status === UserStatus.ACTIVE) {
        throw new ConflictException('User is already active');
      }

      const updatedUser = await this.usersRepository.updateUser(id, {
        status: UserStatus.ACTIVE,
      });
      this.logger.logInfo('User activated successfully', { userId: id });
      return this.userMapper.toResponseDto(updatedUser);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.logError(`Error activating user with ID: ${id}`, { error });
      throw new InternalServerErrorException('Error activating user');
    }
  }

  async searchUsers(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<UserResponseDto>> {
    try {
      const paginationResult = await this.usersRepository.searchUsers(
        query,
        page,
        limit,
      );
      const data = paginationResult.data.map((user) =>
        this.userMapper.toResponseDto(user),
      );

      this.logger.logInfo('Users search completed', {
        query,
        page,
        limit,
        total: paginationResult.total,
      });

      return {
        data,
        total: paginationResult.total,
        page: paginationResult.page,
        limit: paginationResult.limit,
      };
    } catch (error) {
      this.logger.logError('Error searching users', { query, error });
      throw new InternalServerErrorException('Error searching users');
    }
  }

  async isEmailUnique(email: string): Promise<boolean> {
    try {
      const emailExists = await this.usersRepository.emailExists(email);
      this.logger.logDebug('Checked email uniqueness', {
        email,
        isUnique: !emailExists,
      });
      return !emailExists;
    } catch (error) {
      this.logger.logError(`Error checking if email is unique for '${email}'`, {
        error,
      });
      throw new InternalServerErrorException(
        'Error checking if email is unique',
      );
    }
  }

  // other methods...
}
