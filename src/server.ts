import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/services/logger.service';
import * as fs from 'fs';
import { configureApp } from './app';

export async function bootstrap() {
  const httpsOptions =
    process.env.USE_HTTPS === 'true'
      ? {
          key: fs.readFileSync(process.env.SSL_KEY_PATH),
          cert: fs.readFileSync(process.env.SSL_CERT_PATH),
        }
      : null;

  const app = await NestFactory.create(AppModule, { httpsOptions });

  const configService = app.get(ConfigService);
  const logger = new LoggerService(configService);

  app.useLogger(logger);

  app.enableShutdownHooks();

  await configureApp(app, configService, logger);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`Application is running on: ${port}`);

  const shutdown = async (signal: string) => {
    logger.log(`Application is shutting down (${signal})`);
    await app.close();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
