import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggingInterceptor } from './common/utils/logging.interceptor';
import { DatabaseModule } from './core/database/database.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from '@modules/audit/audit.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { DocumentsModule } from '@modules/documents/documents.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { AdminModule } from '@modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    // Core Modules
    CommonModule,
    DatabaseModule,

    // Feature Modules
    UsersModule,
    OrganizationsModule,
    AdminModule,
    DocumentsModule,

    // Supporting Modules
    HealthModule,
    NotificationsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [],
})
export class AppModule {}
