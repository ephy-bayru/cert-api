import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as os from 'os';
import { LoggerService } from 'src/common/services/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomHealthIndicator extends HealthIndicator {
  private readonly memoryThreshold: number;
  private readonly cpuLoadThreshold: number;

  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.memoryThreshold = this.configService.get<number>(
      'MEMORY_THRESHOLD',
      0.05,
    );
    this.cpuLoadThreshold = this.configService.get<number>(
      'CPU_LOAD_THRESHOLD',
      2.0,
    );
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const serviceHealth = await this.checkServiceHealth();
    const memoryUsageHealthy = this.checkMemoryUsage();
    const cpuLoadHealthy = this.checkCpuLoad();
    const dataSyncHealthy = await this.checkDataSync();

    const isHealthy =
      serviceHealth && memoryUsageHealthy && cpuLoadHealthy && dataSyncHealthy;
    const healthDetails = {
      serviceHealth,
      memoryUsage: this.getMemoryUsageDetails(),
      cpuLoad: this.getCpuLoadDetails(),
      dataSync: dataSyncHealthy,
      warnings: this.generateWarnings(
        serviceHealth,
        memoryUsageHealthy,
        cpuLoadHealthy,
        dataSyncHealthy,
      ),
    };

    const result = this.getStatus(key, isHealthy, healthDetails);
    this.logHealthStatus(isHealthy, result);
    return result;
  }

  private async checkServiceHealth(): Promise<boolean> {
    try {
      // Replace with actual service check logic
      return true;
    } catch (error) {
      this.logger.error(
        'Custom service health check failed',
        'CustomHealthIndicator',
        { error },
      );
      return false;
    }
  }

  private async checkDataSync(): Promise<boolean> {
    try {
      // Replace with your actual data synchronization check logic
      // Example: Call a service or check specific conditions
      const isDataInSync = true; // Example placeholder
      if (!isDataInSync) {
        this.logger.warn(
          'Data synchronization issue detected',
          'CustomHealthIndicator',
        );
      }
      return isDataInSync;
    } catch (error) {
      this.logger.error(
        'Data synchronization check failed',
        'CustomHealthIndicator',
        { error },
      );
      return false;
    }
  }

  private checkMemoryUsage(): boolean {
    const freeMemoryRatio = os.freemem() / os.totalmem();
    if (freeMemoryRatio < this.memoryThreshold) {
      this.logger.warn(
        'Memory usage exceeded the threshold',
        'CustomHealthIndicator',
        { freeMemoryRatio },
      );
      return false;
    }
    return true;
  }

  private checkCpuLoad(): boolean {
    const avgCpuLoad = os.loadavg()[0];
    if (avgCpuLoad > this.cpuLoadThreshold) {
      this.logger.warn(
        'CPU load exceeded the threshold',
        'CustomHealthIndicator',
        { avgCpuLoad },
      );
      return false;
    }
    return true;
  }

  private getMemoryUsageDetails() {
    const { rss, heapTotal, heapUsed, external } = process.memoryUsage();
    return { rss, heapTotal, heapUsed, external };
  }

  private getCpuLoadDetails() {
    const [oneMin, fiveMin, fifteenMin] = os.loadavg();
    return { oneMin, fiveMin, fifteenMin };
  }

  private generateWarnings(
    serviceHealth: boolean,
    memoryHealthy: boolean,
    cpuLoadHealthy: boolean,
    dataSyncHealthy: boolean,
  ): string[] {
    const warnings: string[] = [];
    if (!serviceHealth) warnings.push('Service is down');
    if (!memoryHealthy) warnings.push('Memory usage is high');
    if (!cpuLoadHealthy) warnings.push('CPU load is high');
    if (!dataSyncHealthy) warnings.push('Data synchronization issues detected');
    return warnings;
  }

  private logHealthStatus(isHealthy: boolean, result: HealthIndicatorResult) {
    const logMethod = isHealthy ? this.logger.log : this.logger.warn;
    const message = isHealthy
      ? 'System is healthy'
      : 'System health is degraded';
    logMethod(message, 'CustomHealthIndicator', result);
  }
}
