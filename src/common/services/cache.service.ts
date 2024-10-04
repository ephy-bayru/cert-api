import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { serialize, deserialize } from '../utils/serialization-utils';
import { LoggerService } from './logger.service';

@Injectable()
export class CacheService {
  private readonly defaultTtl = 300;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: LoggerService,
  ) {}

  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTtl,
  ): Promise<void> {
    try {
      const serializedValue = serialize(value);
      await this.cacheManager.set(key, serializedValue, ttl);
      this.logger.logInfo(
        `Cache set for key "${key}" with TTL: ${ttl} seconds`,
      );
    } catch (error) {
      this.logger.logError(
        `Error setting cache for key "${key}": ${error.message}`,
        { key, ttl, error },
      );
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<string>(key);
      if (value) {
        this.logger.logInfo(`Cache hit for key "${key}"`);
        return deserialize<T>(value);
      } else {
        this.logger.logDebug(`Cache miss for key "${key}"`);
        return null;
      }
    } catch (error) {
      this.logger.logError(
        `Error getting cache for key "${key}": ${error.message}`,
        { key, error },
      );
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.logInfo(`Cache deleted for key "${key}"`);
    } catch (error) {
      this.logger.logError(
        `Error deleting cache for key "${key}": ${error.message}`,
        { key, error },
      );
      throw error;
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = this.defaultTtl,
  ): Promise<T> {
    let value: T | null = null;
    try {
      value = await this.get<T>(key);
      if (!value) {
        value = await fetchFunction();
        await this.set(key, value, ttl);
        this.logger.logInfo(
          `Cache set for key "${key}" after fetching with TTL: ${ttl} seconds`,
        );
      }
    } catch (error) {
      this.logger.logError(
        `Error in getOrSet for key "${key}": ${error.message}`,
        { key, ttl, error },
      );
      if (!value) {
        value = await fetchFunction();
        this.logger.logWarn(
          `Cache fallback: fetched value for key "${key}" directly due to cache error`,
        );
      }
    }
    return value;
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.cacheManager.store.keys(pattern);
      await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      this.logger.logInfo(`Cache deleted for pattern "${pattern}"`);
    } catch (error) {
      this.logger.logError(
        `Error deleting cache for pattern "${pattern}": ${error.message}`,
        { pattern, error },
      );
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.logInfo('Cache cleared');
    } catch (error) {
      this.logger.logError(`Error clearing cache: ${error.message}`, { error });
      throw error;
    }
  }

  async getTtl(key: string): Promise<number | undefined> {
    try {
      const ttl = await this.cacheManager.store.ttl(key);
      this.logger.logInfo(`TTL for key "${key}": ${ttl}`);
      return ttl;
    } catch (error) {
      this.logger.logError(
        `Error getting TTL for key "${key}": ${error.message}`,
        { key, error },
      );
      throw error;
    }
  }
}
