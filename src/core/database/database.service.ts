import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { LoggerService } from 'src/common/services/logger.service';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(
    private entityManager: EntityManager,
    private logger: LoggerService,
  ) {}

  async onApplicationShutdown(signal: string): Promise<void> {
    try {
      this.logger.logInfo(`Shutting down database connections...`, { signal });

      // Check if the connection is still active before attempting to close it
      if (this.entityManager.connection.isInitialized) {
        await this.entityManager.connection.destroy();
        this.logger.logInfo('Database connections closed successfully.');
      } else {
        this.logger.logWarn('Database connection was already closed.');
      }
    } catch (error) {
      this.logger.logError('Error closing database connections:', { error });
    }
  }
}
