import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as os from 'os';
import { LoggerService } from 'src/common/services/logger.service';

@Injectable()
export class CustomHealthIndicator extends HealthIndicator {
  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext('CustomHealthIndicator');
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const [serviceHealth, memoryUsageHealthy, cpuLoadHealthy] =
      await Promise.all([
        this.checkServiceHealth(),
        this.checkMemoryUsage(),
        this.checkCpuLoad(),
      ]);

    const isHealthy = serviceHealth && memoryUsageHealthy && cpuLoadHealthy;

    const healthDetails = {
      serviceHealth,
      memoryUsage: this.getMemoryUsageDetails(),
      cpuLoad: this.getCpuLoadDetails(),
      warnings: this.generateWarnings(
        serviceHealth,
        memoryUsageHealthy,
        cpuLoadHealthy,
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
      this.logger.logError('Custom service health check failed', { error });
      return false;
    }
  }

  private checkMemoryUsage(): boolean {
    const freeMemoryRatio = os.freemem() / os.totalmem();
    const memoryThreshold = parseFloat(process.env.MEMORY_THRESHOLD || '0.05');

    if (freeMemoryRatio < memoryThreshold) {
      this.logger.logWarn('Memory usage exceeded the threshold', {
        freeMemoryRatio,
      });
      return false;
    }
    return true;
  }

  private checkCpuLoad(): boolean {
    const avgCpuLoad = os.loadavg()[0];
    const cpuLoadThreshold = parseFloat(
      process.env.CPU_LOAD_THRESHOLD || '2.0',
    );

    if (avgCpuLoad > cpuLoadThreshold) {
      this.logger.logWarn('CPU load exceeded the threshold', { avgCpuLoad });
      return false;
    }
    return true;
  }

  private getMemoryUsageDetails() {
    return process.memoryUsage();
  }

  private getCpuLoadDetails() {
    const [oneMin, fiveMin, fifteenMin] = os.loadavg();
    return { oneMin, fiveMin, fifteenMin };
  }

  private generateWarnings(
    serviceHealth: boolean,
    memoryHealthy: boolean,
    cpuLoadHealthy: boolean,
  ): string[] {
    const warnings: string[] = [];
    if (!serviceHealth) warnings.push('Service is down');
    if (!memoryHealthy) warnings.push('Memory usage is high');
    if (!cpuLoadHealthy) warnings.push('CPU load is high');
    return warnings;
  }

  private logHealthStatus(isHealthy: boolean, result: HealthIndicatorResult) {
    if (isHealthy) {
      this.logger.logInfo('System is healthy', result);
    } else {
      this.logger.logWarn('System health is degraded', result);
    }
  }
}
