import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository, LoginPayload } from '../repository/auth.repository';
import { LoginResponseDto, UserDetailsDto } from '../dto/login-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Single entry point to validate any user type.
   * userType can be 'admin' | 'org'/'organization' | 'user'.
   */
  async validateCredentials(
    userType: string,
    email: string,
    password: string,
  ): Promise<LoginPayload> {
    let result: LoginPayload | null = null;

    switch (userType) {
      case 'admin':
        result = await this.authRepo.validateForAdmin(email, password);
        break;
      case 'org':
      case 'organization':
        result = await this.authRepo.validateForOrgUser(email, password);
        break;
      case 'user':
        result = await this.authRepo.validateForRegularUser(email, password);
        break;
      default:
        this.logger.warn(`Invalid user type attempted: ${userType}`);
        throw new ForbiddenException(`Invalid user type: ${userType}`);
    }

    if (!result) {
      this.logger.warn(
        `Invalid credentials or inactive user for email: ${email} (type: ${userType})`,
      );
      throw new UnauthorizedException('Invalid credentials or user inactive');
    }

    return result;
  }

  /**
   * If 2FA is enabled, checks the provided code.
   * You’d integrate your TOTP verification logic here (speakeasy or similar).
   */
  async validate2faIfEnabled(
    loginPayload: LoginPayload,
    code?: string,
  ): Promise<void> {
    if (!loginPayload.twoFactorEnabled) {
      return;
    }
    if (!code) {
      this.logger.warn(`2FA code missing for user: ${loginPayload.id}`);
      throw new UnauthorizedException('2FA code required');
    }
    // In real code, do TOTP validation here:
    const isValid2fa = true; // your real TOTP check
    if (!isValid2fa) {
      this.logger.warn(`Invalid 2FA code for user: ${loginPayload.id}`);
      throw new UnauthorizedException('Invalid 2FA code');
    }
  }

  /**
   * Issues the JWT after validation (and optional 2FA) succeed.
   */
  async login(payload: LoginPayload): Promise<LoginResponseDto> {
    // Build the actual JWT payload
    const tokenPayload: JwtPayload = {
      sub: payload.id,
      roles: payload.role,
      orgId: payload.organizationId,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);
    this.logger.debug(
      `JWT issued for user: ${payload.id}, role: ${payload.role}`,
    );

    // Build a final shaped response with extra user details
    return {
      access_token: accessToken,
      user: this.mapLoginPayloadToResponse(payload),
    };
  }

  /**
   * Maps the login payload to a user details DTO for the final response.
   * If you need more info (like pulling from DB), do it here.
   */
  private mapLoginPayloadToResponse(payload: LoginPayload): UserDetailsDto {
    const userDto: UserDetailsDto = {
      id: payload.id,
      userName: payload.userName ?? 'unknown',
      email: payload.email ?? 'unknown@example.com',
      fullName: payload.fullName ?? 'Unknown User',
      roles: payload.role,
    };

    if (payload.organizationId) {
      userDto.organizationId = payload.organizationId;
    }
    if (payload.additionalInfo) {
      userDto.additionalInfo = payload.additionalInfo;
    }

    return userDto;
  }
}
