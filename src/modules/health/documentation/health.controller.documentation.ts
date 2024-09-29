import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

function generateExample(
  status: 'ok' | 'error',
  databaseStatus: 'up' | 'down',
  externalServiceStatus: 'up' | 'down',
  customServiceStatus: 'up' | 'down',
) {
  return {
    status,
    info: {
      ...(databaseStatus === 'up' && { database: { status: 'up' } }),
      ...(externalServiceStatus === 'up' && {
        externalService: { status: 'up', url: 'https://ephrembayru.com/' },
      }),
      ...(customServiceStatus === 'up' && {
        customService: { status: 'up', customIndicator: 'Service healthy' },
      }),
    },
    error: {
      ...(databaseStatus === 'down' && {
        database: { status: 'down', message: 'Database connection error' },
      }),
      ...(externalServiceStatus === 'down' && {
        externalService: {
          status: 'down',
          message: 'Timeout',
          url: 'https://ephrembayru.com/',
        },
      }),
      ...(customServiceStatus === 'down' && {
        customService: {
          status: 'down',
          message: 'Custom service not responding',
          customIndicator: 'Service unhealthy',
        },
      }),
    },
    details: {
      database: {
        status: databaseStatus,
        message:
          databaseStatus === 'down' ? 'Database connection error' : undefined,
      },
      externalService: {
        status: externalServiceStatus,
        url: 'https://ephrembayru.com/',
      },
      customService: {
        status: customServiceStatus,
        customIndicator:
          customServiceStatus === 'down'
            ? 'Service unhealthy'
            : 'Service healthy',
      },
    },
  };
}

export function HealthCheckDocs() {
  return applyDecorators(
    ApiTags('Health Check'),
    ApiOperation({
      summary: 'Check application health',
      description:
        'Performs a comprehensive health check of the application, including database connectivity, external HTTP service availability, and custom health indicators. This endpoint is essential for monitoring the application’s status and ensuring that all components are functioning correctly.',
    }),
    ApiResponse({
      status: 200,
      description: 'Health check successful. All systems are operational.',
      schema: {
        example: generateExample('ok', 'up', 'up', 'up'),
      },
    }),
    ApiResponse({
      status: 503,
      description:
        'Health check failed. One or more components are not operational.',
      schema: {
        example: generateExample('error', 'down', 'down', 'down'),
      },
    }),
  );
}
