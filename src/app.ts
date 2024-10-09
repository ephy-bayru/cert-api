import { INestApplication, VersioningType } from '@nestjs/common';
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

export async function configureApp(
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
