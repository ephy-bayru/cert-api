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
      this.logger.log('Shutting down database connections...', { signal });
      await this.entityManager.connection.destroy();
      this.logger.log('Database connections closed successfully.');
    } catch (error) {
      this.logger.error('Error closing database connections:', error);
    }
  }
}
