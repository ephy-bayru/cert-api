import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CustomHealthIndicator } from './indicators/custom.health';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/services/logger.service';

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  private memoryHeapThreshold: number;
  private memoryRSSThreshold: number;
  private dbHealthTimeout: number;
  private externalServiceUrl: string;

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly customHealth: CustomHealthIndicator,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.initializeConfig();
  }

  private initializeConfig(): void {
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

    this.logger.log(
      'HealthController configuration initialized',
      'HealthController',
      {
        memoryHeapThreshold: this.memoryHeapThreshold,
        memoryRSSThreshold: this.memoryRSSThreshold,
        dbHealthTimeout: this.dbHealthTimeout,
        externalServiceUrl: this.externalServiceUrl,
      },
    );
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Performs a complete system health check' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @ApiResponse({ status: 500, description: 'Health check failed' })
  async checkHealth() {
    try {
      const result = await this.health.check([
        () => this.checkDatabase(),
        () => this.checkExternalService(),
        () => this.memory.checkHeap('memory_heap', this.memoryHeapThreshold),
        () => this.memory.checkRSS('memory_rss', this.memoryRSSThreshold),
        () => this.customHealth.isHealthy('systemHealth'),
      ]);

      this.logger.log('Health check successful', 'HealthController', result);
      return { status: result.status, info: result.info };
    } catch (error) {
      this.logger.error('Health check failed', 'HealthController', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalServerErrorException('Health check failed');
    }
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    this.logger.debug('Checking database health', 'HealthController', {
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
    this.logger.debug('Checking external service health', 'HealthController', {
      url: this.externalServiceUrl,
    });
    return this.http.pingCheck('externalService', this.externalServiceUrl);
  }
}
