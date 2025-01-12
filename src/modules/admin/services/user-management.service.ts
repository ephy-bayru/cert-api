import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserManagementRepository } from '../repositories/user-management.repository';
import { User } from '@modules/users/entities/user.entity';
import { LoggerService } from '@common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from '@common/interfaces/IPagination';
import { IsNull, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@modules/users/entities/user-status.enum';
import { CreateUserDto } from '@modules/users/dtos/create-user.dto';
import { UpdateUserDto } from '@modules/users/dtos/update-user.dto';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { Address } from '@modules/users/entities/address.entity';
import { AddressDto } from '@modules/users/dtos/address.dto';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserManagementRepository,
    private readonly logger: LoggerService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    createdById: string,
  ): Promise<UserResponseDto> {
    try {
      // Normalize email
      createUserDto.email = createUserDto.email.trim().toLowerCase();

      // Check if email already exists
      const emailExists = await this.userRepository.checkEmailExists(
        createUserDto.email,
      );

      if (emailExists) {
        throw new ConflictException('Email is already in use.');
      }

      // Hash password
      if (!createUserDto.password) {
        throw new BadRequestException('Password is required.');
      }
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      const user = await this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        createdBy: createdById,
        status: UserStatus.ACTIVE,
      });

      this.logger.log('User created successfully', 'UserManagementService', {
        userId: user.id,
      });

      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error('Failed to create user', 'UserManagementService', {
        error,
      });
      throw error;
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    updatedById: string,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Normalize email if updating
      if (updateUserDto.email) {
        updateUserDto.email = updateUserDto.email.trim().toLowerCase();

        // Check if email is already in use by another user
        const existingUser = await this.userRepository.findOne({
          where: {
            email: updateUserDto.email,
            id: Not(id),
            deletedAt: IsNull(),
          },
        });

        if (existingUser) {
          throw new ConflictException('Email is already in use.');
        }
      }

      // Hash new password if provided
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
      }

      // Handle address update if provided
      const { address, ...userUpdateData } = updateUserDto;
      if (address) {
        if (user.address) {
          Object.assign(user.address, address);
        } else {
          user.address = Object.assign(new Address(), address);
        }
      }

      // Update user fields
      Object.assign(user, userUpdateData);
      user.updatedBy = updatedById;

      await this.userRepository.save(user);

      this.logger.log('User updated successfully', 'UserManagementService', {
        userId: id,
      });

      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error('Failed to update user', 'UserManagementService', {
        error,
      });
      throw error;
    }
  }

  async findUserById(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.toResponseDto(user);
    } catch (error) {
      this.logger.error('Failed to find user by ID', 'UserManagementService', {
        error,
      });
      throw error;
    }
  }

  async listUsers(
    options: PaginationOptions<User>,
    filters?: {
      status?: UserStatus;
      search?: string;
    },
  ): Promise<PaginationResult<UserResponseDto>> {
    try {
      const users = await this.userRepository.getUsers(options, filters);

      this.logger.log('Users listed successfully', 'UserManagementService', {
        total: users.total,
      });

      const data = users.data.map((user) => this.toResponseDto(user));

      return { ...users, data };
    } catch (error) {
      this.logger.error('Failed to list users', 'UserManagementService', {
        error,
      });
      throw error;
    }
  }

  async activateUser(id: string, activatedById: string): Promise<void> {
    try {
      await this.userRepository.activateUser(id);

      this.logger.log('User activated successfully', 'UserManagementService', {
        userId: id,
        activatedById,
      });
    } catch (error) {
      this.logger.error('Failed to activate user', 'UserManagementService', {
        error,
      });
      throw error;
    }
  }

  async deactivateUser(id: string, deactivatedById: string): Promise<void> {
    try {
      await this.userRepository.deactivateUser(id);

      this.logger.log(
        'User deactivated successfully',
        'UserManagementService',
        {
          userId: id,
          deactivatedById,
        },
      );
    } catch (error) {
      this.logger.error('Failed to deactivate user', 'UserManagementService', {
        error,
      });
      throw error;
    }
  }

  async lockUserAccount(id: string): Promise<void> {
    try {
      await this.userRepository.lockUserAccount(id);

      this.logger.log(
        'User account locked successfully',
        'UserManagementService',
        {
          userId: id,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to lock user account',
        'UserManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  async unlockUserAccount(id: string): Promise<void> {
    try {
      await this.userRepository.unlockUserAccount(id);

      this.logger.log(
        'User account unlocked successfully',
        'UserManagementService',
        {
          userId: id,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to unlock user account',
        'UserManagementService',
        {
          error,
        },
      );
      throw error;
    }
  }

  private toResponseDto(user: User): UserResponseDto {
    const {
      password,
      twoFactorSecret,
      resetPasswordToken,
      resetPasswordExpires,
      emailVerificationToken,
      deletedAt,
      updatedBy,
      createdBy,
      ...rest
    } = user;

    const userResponse = new UserResponseDto({
      id: rest.id,
      email: rest.email,
      firstName: rest.firstName ?? '',
      lastName: rest.lastName ?? '',
      userName: rest.userName ?? '',
      fullName: `${rest.firstName ?? ''} ${rest.lastName ?? ''}`.trim(),
      isActive: rest.status === UserStatus.ACTIVE,
      roles: rest.roles,
      status: rest.status,
      provider: rest.provider,
      fcn: rest.fcn,
      fin: rest.fin,
      address: rest.address ? new AddressDto() : undefined,
      createdAt: rest.createdAt,
      updatedAt: rest.updatedAt,
    });

    return userResponse;
  }
}
