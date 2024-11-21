import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/services/logger.service';
import { SwaggerModule } from '@nestjs/swagger';
import {
  swaggerConfig,
  swaggerCustomOptions,
  applySwaggerGlobalApiResponses,
} from './config/swagger.config';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as fs from 'fs';
import { Request, Response } from 'express';

interface HttpsOptions {
  key: Buffer;
  cert: Buffer;
}

/**
 * Configures the NestJS application with middleware, security settings, and Swagger.
 */
async function configureApp(
  app: INestApplication,
  configService: ConfigService,
  logger: LoggerService,
): Promise<void> {
  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger, configService));

  // Security middleware
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.enableCors();

  // API versioning configuration
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get<string>('API_DEFAULT_VERSION', '1'),
    prefix: 'v',
  });

  // Swagger documentation setup
  setupSwagger(app);

  // Add root redirect to Swagger documentation
  app.getHttpAdapter().get('/', (req: Request, res: Response) => {
    res.redirect('/api/docs');
  });

  logger.log('App configuration completed successfully', 'ConfigureApp');
}

/**
 * Sets up Swagger documentation for the application.
 */
function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const documentWithGlobalResponses = applySwaggerGlobalApiResponses(document);

  SwaggerModule.setup('api/docs', app, documentWithGlobalResponses, {
    ...swaggerCustomOptions,
    swaggerOptions: {
      ...swaggerCustomOptions.swaggerOptions,
    },
  });
}

/**
 * Gets HTTPS options if SSL is enabled.
 */
function getHttpsOptions(): HttpsOptions | undefined {
  const useHttps = process.env.USE_HTTPS === 'true';

  if (!useHttps) {
    return undefined;
  }

  try {
    const keyPath = process.env.SSL_KEY_PATH;
    const certPath = process.env.SSL_CERT_PATH;

    if (!keyPath || !certPath) {
      throw new Error('SSL paths not properly configured');
    }

    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } catch (error) {
    console.error('Failed to load SSL certificates:', error);
    process.exit(1);
  }
}

/**
 * Bootstraps the NestJS application.
 */
async function bootstrap(): Promise<void> {
  // Apply HTTPS options if SSL is enabled
  const httpsOptions = getHttpsOptions();

  // Create the main application with the httpsOptions
  const app = await NestFactory.create(AppModule, {
    ...(httpsOptions ? { httpsOptions } : {}),
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  app.useLogger(logger);
  app.enableShutdownHooks();

  await configureApp(app, configService, logger);

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);
  logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap', {
    port,
    host,
  });
}

/**
 * Starts the application with error handling.
 */
async function startApp(): Promise<void> {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
}

// Start app only if running directly
if (require.main === module) {
  startApp();
}

export { startApp, bootstrap, configureApp };
