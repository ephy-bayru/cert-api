import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHealthIndicator } from './indicators/custom.health';
import { LoggerService } from 'src/common/services/logger.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Health Check')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  private readonly memoryHeapThreshold: number;
  private readonly memoryRSSThreshold: number;
  private readonly dbHealthTimeout: number;
  private readonly externalServiceUrl: string;

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly customHealth: CustomHealthIndicator,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('HealthController');
    // Extract configuration values
    this.memoryHeapThreshold = this.configService.get<number>(
      'MEMORY_HEAP_THRESHOLD',
      150 * 1024 * 1024,
    );
    this.memoryRSSThreshold = this.configService.get<number>(
      'MEMORY_RSS_THRESHOLD',
      300 * 1024 * 1024,
    );
    this.dbHealthTimeout = this.configService.get<number>(
      'DB_HEALTH_TIMEOUT',
      3000,
    );
    this.externalServiceUrl = this.configService.get<string>(
      'EXTERNAL_SERVICE_URL',
      'https://ephrembayru.com/',
    );
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Performs a complete system health check' })
  async checkHealth() {
    try {
      const result = await this.health.check([
        () => this.checkDatabase(),
        () => this.checkExternalService(),
        () => this.memory.checkHeap('memory_heap', this.memoryHeapThreshold),
        () => this.memory.checkRSS('memory_rss', this.memoryRSSThreshold),
        () => this.customHealth.isHealthy('systemHealth'),
      ]);

      this.logger.logInfo('Health check successful', result);
      return { status: result.status, info: result.info };
    } catch (error) {
      this.logger.logError('Health check failed', { error });
      throw error;
    }
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    this.logger.logDebug('Checking database health', {
      timeout: this.dbHealthTimeout,
    });

    const start = Date.now();
    const dbResult = await this.db.pingCheck('database', {
      timeout: this.dbHealthTimeout,
    });
    const responseTime = Date.now() - start;

    return {
      database: {
        status: dbResult.database.status,
        responseTime: `${responseTime}ms`,
        uptime: process.uptime(),
        connectionStatus:
          dbResult.database.status === 'up' ? 'connected' : 'disconnected',
      },
    };
  }

  private checkExternalService() {
    this.logger.logDebug('Checking external service health', {
      url: this.externalServiceUrl,
    });
    return this.http.pingCheck('externalService', this.externalServiceUrl);
  }
}
