import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomHealthIndicator } from './indicators/custom.health';
import { HealthCheckDocs } from './documentation/health.controller.documentation';
import { ConfigService } from '@nestjs/config';

@ApiTags('Health Check')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private customIndicator: CustomHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @HealthCheckDocs()
  @ApiOperation({ summary: 'Check application health' })
  check() {
    return this.health.check([
      // Check database health with custom timeout
      () =>
        this.db.pingCheck('database', {
          timeout: this.configService.get<number>('DB_HEALTH_TIMEOUT', 3000),
        }),

      // Check external service health
      () =>
        this.http.pingCheck(
          'externalService',
          this.configService.get<string>(
            'EXTERNAL_SERVICE_URL',
            'https://ephrembayru.com/',
          ),
        ),

      // Custom service health
      () => this.customIndicator.isHealthy('customService'),

      // Disk space check (threshold set at 500MB free space)
      () =>
        this.disk.checkStorage('diskHealth', {
          thresholdPercent: 0.9,
          path: '/',
        }),

      // Memory usage check (alert if available memory < 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150 MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300 MB
    ]);
  }
}
