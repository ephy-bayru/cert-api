import { Controller, Post, Body, HttpCode, HttpStatus, UseFilters, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginDocs } from '../documentations/auth.controller.documentation';
import { ApiTags } from '@nestjs/swagger';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginDocs()
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    // 1. Validate credentials
    const loginPayload = await this.authService.validateCredentials(
      loginDto.type,
      loginDto.email,
      loginDto.password,
    );

    // 2. (Optional) 2FA check
    await this.authService.validate2faIfEnabled(loginPayload, loginDto.code);

    // 3. Issue JWT & return final shaped response
    return this.authService.login(loginPayload);
  }
}
