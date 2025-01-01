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
import { User } from '../entities/user.entity';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { UserStatus } from '../entities/user-status.enum';
import { Address } from '../entities/address.entity';
import { GlobalRole } from '@common/enums/global-role.enum';

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
      // Ensure unique fields
      await this.checkUniqueFields(createUserDto);

      if (!createUserDto.password) {
        throw new BadRequestException('Password is required.');
      }
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

      // Create user via repository method
      const newUser = await this.usersRepository.createUser(createUserDto);

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
        ![GlobalRole.PLATFORM_ADMIN, GlobalRole.PLATFORM_SUPER_ADMIN].includes(
          currentUser.role,
        )
      ) {
        throw new ForbiddenException(
          'Only platform or super admins can change role or status',
        );
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
    if (
      currentUser.role !== GlobalRole.PLATFORM_ADMIN &&
      currentUser.role !== GlobalRole.ORG_SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only platform or org super admins can do that',
      );
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
    return this.updateUserStatus(id, UserStatus.INACTIVE, currentUser);
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
   * Increments failed login attempts.
   */
  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.usersRepository.incrementFailedLoginAttempts(id);
    this.logger.log('Incremented failed login attempts', 'UsersService', {
      userId: id,
    });
  }

  /**
   * Checks unique fields during user creation.
   */
  private async checkUniqueFields(userData: CreateUserDto): Promise<void> {
    const existingFields: string[] = [];

    const fieldsToCheck: Array<keyof CreateUserDto> = [
      'email',
      'userName',
      'fcn',
      'fin',
    ];

    for (const field of fieldsToCheck) {
      const value = userData[field];
      if (value) {
        const exists = await this.usersRepository.fieldExists(
          field as string,
          value,
        );
        if (exists) {
          existingFields.push(field);
        }
      }
    }

    if (userData.address?.phoneNumber) {
      const exists = await this.usersRepository.fieldExists(
        'address.phoneNumber',
        userData.address.phoneNumber,
      );
      if (exists) {
        existingFields.push('phoneNumber');
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
    const existingFields: string[] = [];

    // Define the fields that exist on both UpdateUserDto and User
    const fieldsToCheck: Array<'email' | 'userName' | 'fcn' | 'fin'> = [
      'email',
      'userName',
      'fcn',
      'fin',
    ];

    for (const field of fieldsToCheck) {
      const newValue = updateUserDto[field];
      const existingValue = existingUser[field as keyof User];
      if (newValue && newValue !== existingValue) {
        const exists = await this.usersRepository.fieldExists(field, newValue);
        if (exists) {
          existingFields.push(field);
        }
      }
    }

    if (updateUserDto.address?.phoneNumber) {
      const newPhoneNumber = updateUserDto.address.phoneNumber;
      const existingPhoneNumber = existingUser.address?.phoneNumber;
      if (newPhoneNumber && newPhoneNumber !== existingPhoneNumber) {
        const exists = await this.usersRepository.fieldExists(
          'address.phoneNumber',
          newPhoneNumber,
        );
        if (exists) {
          existingFields.push('phoneNumber');
        }
      }
    }

    if (existingFields.length > 0) {
      throw new ConflictException(
        `The following fields already exist: ${existingFields.join(', ')}`,
      );
    }
  }

  async isFieldUnique(field: string, value: string): Promise<boolean> {
    return !(await this.usersRepository.fieldExists(field, value));
  }

  async isEmailUnique(email: string): Promise<boolean> {
    return this.isFieldUnique('email', email.trim().toLowerCase());
  }

  async isUserNameUnique(userName: string): Promise<boolean> {
    return this.isFieldUnique('userName', userName.trim());
  }

  async isFcnUnique(fcn: string): Promise<boolean> {
    return this.isFieldUnique('fcn', fcn);
  }

  async isFinUnique(fin: string): Promise<boolean> {
    return this.isFieldUnique('fin', fin);
  }

  async isPhoneNumberUnique(phoneNumber: string): Promise<boolean> {
    return this.isFieldUnique('address.phoneNumber', phoneNumber);
  }
}
