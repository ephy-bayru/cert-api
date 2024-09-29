import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../services/users.service';

interface UserValidationDTO {
  email: string;
}

@Injectable()
export class UniqueUserValidationPipe implements PipeTransform {
  constructor(private readonly usersService: UsersService) {}

  async transform(value: UserValidationDTO): Promise<UserValidationDTO> {
    const { email } = value;

    const isUnique = await this.usersService.isEmailUnique(email);
    if (!isUnique) {
      throw new BadRequestException(`Email ${email} is already in use`);
    }

    return value;
  }
}
