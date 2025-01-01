import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

/**
 * Documentation for the login endpoint in AuthController.
 */
export function LoginDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login for admin, organization user, or regular user',
      description: `
      **Usage**:
      - Provide your user type in \`type\`: 'admin', 'org'/'organization', or 'user'.
      - Supply valid \`email\` and \`password\`.
      - If 2FA is enabled, pass \`code\`.
      `,
    }),

    ApiBody({
      description: 'Login request payload',
      type: LoginDto,
      examples: {
        adminExample: {
          summary: 'Admin user login',
          value: {
            type: 'admin',
            email: 'admin@example.com',
            password: 'AdminP@ss123',
          },
        },
        orgExample: {
          summary: 'Organization user login',
          value: {
            type: 'org',
            email: 'orguser@company.com',
            password: 'OrgUser@123',
          },
        },
        userExample: {
          summary: 'Regular user login',
          value: {
            type: 'user',
            email: 'john.doe@example.com',
            password: 'User#Password1',
            code: '123456', // if 2FA is enabled
          },
        },
      },
    }),

    ApiResponse({
      status: 200,
      description: 'User successfully logged in; JWT token returned.',
      type: LoginResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials or inactive user.',
    }),
    ApiResponse({
      status: 403,
      description: 'Invalid user type or 2FA code issues.',
    }),
  );
}
