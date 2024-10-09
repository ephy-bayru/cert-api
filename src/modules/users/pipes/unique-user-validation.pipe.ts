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
    const nonUniqueFields = results.filter((result) => result !== null);

    if (nonUniqueFields.length > 0) {
      throw new BadRequestException(
        `The following fields are already in use: ${nonUniqueFields.join(', ')}`,
      );
    }

    return value;
  }

  private async checkEmailUniqueness(email: string): Promise<string | null> {
    const isUnique = await this.usersService.isEmailUnique(email);
    return isUnique ? null : 'email';
  }

  private async checkUserNameUniqueness(
    userName: string,
  ): Promise<string | null> {
    const isUnique = await this.usersService.isUserNameUnique(userName);
    return isUnique ? null : 'userName';
  }

  private async checkFcnUniqueness(fcn: string): Promise<string | null> {
    const isUnique = await this.usersService.isFcnUnique(fcn);
    return isUnique ? null : 'fcn';
  }

  private async checkFinUniqueness(fin: string): Promise<string | null> {
    const isUnique = await this.usersService.isFinUnique(fin);
    return isUnique ? null : 'fin';
  }
}
