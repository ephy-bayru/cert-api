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

async function configureApp(
  app: INestApplication,
  configService: ConfigService,
  logger: LoggerService,
): Promise<void> {
  app.useGlobalFilters(
    new GlobalExceptionFilter(logger, app.get(ConfigService)),
  );
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.enableCors();

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get<string>('API_DEFAULT_VERSION', 'v1'),
    prefix: 'v',
  });

  // Swagger setup
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const documentWithGlobalResponses = applySwaggerGlobalApiResponses(document);
  const baseUrl =
    process.env.BASE_URL ||
    `http://localhost:${configService.get('PORT', 3000)}`;
  SwaggerModule.setup('api/docs', app, documentWithGlobalResponses, {
    ...swaggerCustomOptions,
    swaggerOptions: {
      ...swaggerCustomOptions.swaggerOptions,
      baseUrl,
    },
  });

  logger.log('ConfigureApp', 'App configuration completed.');
}

function getHttpsOptions() {
  if (process.env.USE_HTTPS !== 'true') {
    return null;
  }
  return {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  };
}

function setupShutdownHandlers(app: INestApplication, logger: LoggerService) {
  const shutdown = async (signal: string) => {
    logger.log(`Application is shutting down (${signal})`, 'Bootstrap');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: getHttpsOptions(),
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);
  app.enableShutdownHooks();

  await configureApp(app, configService, logger);

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);
  logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');

  setupShutdownHandlers(app, logger);
}

async function startApp() {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Application failed to start:', error);
    process.exit(1);
  }
}

// Only start the app if this file is being run directly
if (require.main === module) {
  startApp();
}

// Export functions for potential use in tests or other modules
export { startApp, bootstrap, configureApp };
