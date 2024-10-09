import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/services/logger.service';
import * as fs from 'fs';
import { configureApp } from './app';

export async function bootstrap() {
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

function getHttpsOptions() {
  if (process.env.USE_HTTPS !== 'true') {
    return null;
  }

  return {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  };
}

function setupShutdownHandlers(app: any, logger: LoggerService) {
  const shutdown = async (signal: string) => {
    logger.log(`Application is shutting down (${signal})`, 'Bootstrap');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Call bootstrap function
bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
