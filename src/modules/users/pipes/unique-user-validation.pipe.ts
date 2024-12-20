import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../services/users.service';

interface UserValidationDTO {
  email: string;
  userName?: string;
  fcn?: string;
  fin?: string;
}

@Injectable()
export class UniqueUserValidationPipe implements PipeTransform {
  constructor(private readonly usersService: UsersService) {}

  async transform(value: UserValidationDTO): Promise<UserValidationDTO> {
    const { email, userName, fcn, fin } = value;

    const uniqueChecks = [
      this.checkEmailUniqueness(email),
      ...(userName ? [this.checkUserNameUniqueness(userName)] : []),
      ...(fcn ? [this.checkFcnUniqueness(fcn)] : []),
      ...(fin ? [this.checkFinUniqueness(fin)] : []),
    ];

    const results = await Promise.all(uniqueChecks);
    const conflictMessages = results.filter((result) => result !== null);

    if (conflictMessages.length > 0) {
      throw new BadRequestException(
        `Validation failed: ${conflictMessages.join(' ')}`,
      );
    }

    return value;
  }

  private async checkEmailUniqueness(email: string): Promise<string | null> {
    const isUnique = await this.usersService.isEmailUnique(email);
    return isUnique
      ? null
      : `The email "${email}" is already associated with an existing account.`;
  }

  private async checkUserNameUniqueness(
    userName: string,
  ): Promise<string | null> {
    const isUnique = await this.usersService.isUserNameUnique(userName);
    return isUnique
      ? null
      : `The username "${userName}" is already in use. Please choose another.`;
  }

  private async checkFcnUniqueness(fcn: string): Promise<string | null> {
    const isUnique = await this.usersService.isFcnUnique(fcn);
    return isUnique
      ? null
      : `The FCN "${fcn}" is already registered. If this is incorrect, please contact support.`;
  }

  private async checkFinUniqueness(fin: string): Promise<string | null> {
    const isUnique = await this.usersService.isFinUnique(fin);
    return isUnique
      ? null
      : `The FIN "${fin}" is already associated with an existing account.`;
  }
}
