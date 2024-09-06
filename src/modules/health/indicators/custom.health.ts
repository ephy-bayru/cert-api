import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import * as os from 'os';

@Injectable()
export class CustomHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const serviceHealthy = this.checkCustomService();
    const memoryUsage = this.checkMemoryUsage();

    const isHealthy = serviceHealthy && memoryUsage;
    const result = this.getStatus(key, isHealthy, {
      serviceHealthy,
      memoryUsage: process.memoryUsage(),
      uptime: os.uptime(),
    });

    if (!isHealthy) {
      throw new HealthCheckError(
        'Custom service or system check failed',
        result,
      );
    }
    return result;
  }

  private checkCustomService(): boolean {
    // Add a real check for a custom service, e.g., a custom database or service.
    return true;
  }

  private checkMemoryUsage(): boolean {
    const freeMemory = os.freemem() / os.totalmem();
    return freeMemory > 0.1;
  }
}
